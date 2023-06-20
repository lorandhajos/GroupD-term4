#include <SPI.h>
#include <RH_RF95.h>
#include <RHDatagram.h>

#define RFM95_CS    8 // 
#define RFM95_INT   7 // 
#define RFM95_RST   4 // 

constexpr double defaultFrequency = 915.0;

const int maxMessages = 25;

// C-style strings are probably more memory efficient, but an array of an array of chars is difficult to deal with
// Convert the String to char[] before sending it over the cable!
String g_msgArray[maxMessages];

int g_freeIndexMsg = 0;
bool g_msgArrayFull = false;

double g_currentFrequency = defaultFrequency;

const uint8_t ClearFlagsMask = 0b00001111;
const uint8_t ReqAckMask     = 0b00000001;
const uint8_t IsAckMask      = 0b00000010;
const uint8_t IsKeyMask      = 0b00000100;
const uint8_t IsSOSMask      = 0b00001000;

// Radio driver
RH_RF95 rf95(RFM95_CS, RFM95_INT);
RHDatagram manager(rf95, 12);

void resetRST() {
    digitalWrite(RFM95_RST, LOW);
    delay(10);
    digitalWrite(RFM95_RST, HIGH);
    delay(10);
}

void setFlags(uint8_t flag) {
    // cleaning up all flags
    manager.setHeaderFlags(RH_FLAGS_NONE, ClearFlagsMask);
    // setting the new flag
    manager.setHeaderFlags(flag);
}

bool hasFlag(uint8_t flag, uint8_t target) {
    return (flag & target);
}

void addMessageToArray(String message) {
    if (g_freeIndexMsg < maxMessages) {
        g_msgArray[g_freeIndexMsg] = message;
        g_freeIndexMsg++;
    }
    else {
        g_msgArrayFull = true;
        g_freeIndexMsg = 0;
        addMessageToArray(message);
    }
}

bool sendRadioMessage(char* buf, int len, int address = 255, int timeout=1000) {
    manager.sendto(buf, len, address);
    return manager.waitPacketSent(timeout);
    setFlags(0);
}

bool checkConnection() {
    //if (Serial) {
    //    return true;
    //} 
    return false;
}

String convert(uint8_t from, uint8_t flag, String message) {
    String fullMsg = "";
    if (from < 10) {
        fullMsg.concat("00");
        fullMsg.concat(from);
    }
    else if (from < 100) {
        fullMsg.concat("0");
        fullMsg.concat(from);
    }
    else {
        fullMsg.concat(from);
    }
    fullMsg.concat(flag);
    fullMsg.concat(message);
    return fullMsg;
}

void sendMessageToPhone(String msg) {
    char buf[255];
    msg.toCharArray(buf, 255);
    Serial.write(buf);
    Serial.write('\n');
}

void sendAllMessagesToPhone() {
    /*
    if (!g_msgArray && g_freeIndexMsg == 0) {
        return;
    }
    */
    int index = g_freeIndexMsg + 1;
    if (g_msgArrayFull) {
        index = maxMessages;
    }
    for (int i=0; i<index; i++) {
        //Serial.println(i);
        if (g_msgArray[i].length() > 0) {
            sendMessageToPhone(g_msgArray[i]);
            g_msgArray[i] = "";
        }
    }
    g_freeIndexMsg = 0;
    g_msgArrayFull = false;
}
void sendAck(uint8_t id, char* contents, uint8_t address=255) {
    manager.setHeaderId(id);
    rf95.setModeIdle();
    setFlags(IsAckMask);
    sendRadioMessage(contents, sizeof(contents), address);
}
  
bool getRadioMessage() {
    rf95.setModeRx();
    if (manager.available()) {
        // check if there is a message for us
        char lastMessage[255];
        uint8_t len = sizeof(lastMessage);
        if (manager.recvfrom(lastMessage, &len)) {
            uint8_t msgFlags = manager.headerFlags();
            if (hasFlag(msgFlags, IsAckMask)) {
                //discard the ackhnowledgment messages
                return false;
            }
            uint8_t sender = manager.headerFrom();
            String convMessage = convert(sender, msgFlags, lastMessage);
            if (checkConnection()) {
                sendMessageToPhone(convMessage);
                if (hasFlag(msgFlags, ReqAckMask)) {
                    delay(100);
                    sendAck(manager.headerId(), "0", sender);
                }
                return true;
            }
            addMessageToArray(convMessage);
            if (hasFlag(msgFlags, ReqAckMask)) {
                delay(100);
                sendAck(manager.headerId(), "0", sender);
            }
            return true;
        }
    }
    return false;
}

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);
  rf95.init();
  manager.init();
  Serial.begin(115200);
  while (!Serial) delay(1);
  delay(100);

  Serial.println("Start up");

  // manual reset
  resetRST();

  while (!rf95.init()) {
    Serial.println("LoRa radio init failed");
  }
  Serial.println("LoRa radio init OK!");

  // Defaults after init are 434.0MHz, modulation GFSK_Rb250Fd250, +13dbM
  if (!rf95.setFrequency(defaultFrequency)){//915.0)) {
    Serial.println("setFrequency failed");
    while (1);
  }
  Serial.print("Set Freq to: "); Serial.println("");

  // Defaults after init are 434.0MHz, 13dBm, Bw = 125 kHz, Cr = 4/5, Sf = 128chips/symbol, CRC on

  // The default transmitter power is 13dBm, using PA_BOOST.
  // If you are using RFM95/96/97/98 modules which uses the PA_BOOST transmitter pin, then
  // you can set transmitter powers from 5 to 23 dBm:
  rf95.setTxPower(23, false);
}
void loop() {
    getRadioMessage();
    sendAllMessagesToPhone();
}
