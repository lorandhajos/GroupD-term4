#include <SPI.h>
#include <RH_RF95.h>
#include <RHDatagram.h>

#define RFM95_CS    8 // 
#define RFM95_INT   7 // 
#define RFM95_RST   4 // 

// Change to 434.0 or other frequency, must match RX's freq!
#define RF95_FREQ 915.0

constexpr double defaultFrequency = 915.0;

const int maxMessages = 15;

char g_msgArray[maxMessages][RH_RF95_MAX_MESSAGE_LEN];
int g_freeIndexMsg = 0;
char g_lastMessage[RH_RF95_MAX_MESSAGE_LEN];

double g_currentFrequency = defaultFrequency;

const uint8_t BITMASK_CLEAR_ALL = 0b00001111;
const uint8_t BITMASK_ACK_REQ   = 0b00000001;
const uint8_t BITMASK_IS_ACK    = 0b00000010;
const uint8_t BITMASK_IS_KEY    = 0b00000100;
const uint8_t BITMASK_IS_SOS    = 0b00001000;


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
    manager.setHeaderFlags(RH_FLAGS_NONE, BITMASK_CLEAR_ALL);
    // setting the new flag
    manager.setHeaderFlags(flag);
}

bool hasFlag(uint8_t flag, uint8_t target) {
    return (flag & target);
}

bool getRadioMessage() {
    if (manager.available()) {
        // check if there is a message for us
        uint8_t len = sizeof(g_lastMessage);
        Serial.println(manager.headerFrom());
        if (manager.recvfrom(g_lastMessage, &len)) {
            // if this is a key, send a message to the phone
            uint8_t msgFlags = manager.headerFlags(); 
            if (hasFlag(msgFlags, BITMASK_IS_SOS)) {
                Serial.write("SOS");
                Serial.write('\n');
            }
            if (hasFlag(msgFlags, BITMASK_IS_KEY)) {
                Serial.write(g_lastMessage);
                Serial.write('\n');
            }
            // if this is an acknowledgement
            if (hasFlag(msgFlags, BITMASK_IS_ACK)) {
                Serial.println(manager.headerId());
            }
            // if this requires an acknowledgement
            if (hasFlag(msgFlags, BITMASK_ACK_REQ)) {
                manager.setHeaderId(manager.headerId());
                sendRadioMessage("0", 2);
            }
            Serial.print("Requires acknowledgement: ");
            Serial.println(hasFlag(manager.headerFlags(), BITMASK_ACK_REQ));
            Serial.print("Is an acknowledgement: ");
            Serial.println(hasFlag(manager.headerFlags(), BITMASK_IS_ACK));
            Serial.print("Is a key: ");
            Serial.println(hasFlag(manager.headerFlags(), BITMASK_IS_KEY));
            return true;
        }
    }
    return false;
}

bool sendRadioMessage(char* buf, int len, int address = 255, int timeout=1000) {
    manager.sendto(buf, len, address);
    return manager.waitPacketSent(timeout);
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
    int count = 0;
    /*if (Serial.available() > 0 && count == 0) {
        count++;
        char msg[RH_RF95_MAX_MESSAGE_LEN];
        int len = Serial.readBytes(msg, RH_RF95_MAX_MESSAGE_LEN);
        Serial.print("us: ");
        Serial.print(msg);
        sendRadioMessage(msg, len);
    }*/
    rf95.setModeRx();
    if (getRadioMessage()) {
        Serial.print("them: ");
        Serial.println(g_lastMessage);
        /*
        // Send a reply
        uint8_t data[] = "And hello back to you";
        rf95.send(data, sizeof(data));
        rf95.waitPacketSent();
        Serial.println("Sent a reply");
        digitalWrite(LED_BUILTIN, LOW);
    } 
    else {
        Serial.println("No messages for us");
    }
    */
    }
}
