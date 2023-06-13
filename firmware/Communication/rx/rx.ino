#include <SPI.h>
#include <RH_RF95.h>
#include <RHDatagram.h>

#define RFM95_CS    8 // 
#define RFM95_INT   7 // 
#define RFM95_RST   4 // 

// Change to 434.0 or other frequency, must match RX's freq!
#define RF95_FREQ 915.0

constexpr double defaultFreq = 915.0;

const int maxMessages = 15;

char g_msgArray[maxMessages][RH_RF95_MAX_MESSAGE_LEN];
int g_freeIndexMsg = 0;
char g_lastMessage[RH_RF95_MAX_MESSAGE_LEN];

const uint8_t BITMASK_ACK_REQ = 0b00000001;
const uint8_t BITMASK_IS_ACK =  0b00000010;
const uint8_t BITMASK_IS_KEY =  0b00000100;

// Radio driver
RH_RF95 rf95(RFM95_CS, RFM95_INT);
RHDatagram manager(rf95, 7);
void resetRST() {
    digitalWrite(RFM95_RST, LOW);
    delay(10);
    digitalWrite(RFM95_RST, HIGH);
    delay(10);
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

  Serial.println("Feather LoRa RX Test!");

  // manual reset
  resetRST();

  while (!rf95.init()) {
    Serial.println("LoRa radio init failed");
    Serial.println("Uncomment '#define SERIAL_DEBUG' in RH_RF95.cpp for detailed debug info");
    while (1);
  }
  Serial.println("LoRa radio init OK!");

  // Defaults after init are 434.0MHz, modulation GFSK_Rb250Fd250, +13dbM
  if (!rf95.setFrequency(RF95_FREQ)) {
    Serial.println("setFrequency failed");
    while (1);
  }
  Serial.print("Set Freq to: "); Serial.println(RF95_FREQ);

  // Defaults after init are 434.0MHz, 13dBm, Bw = 125 kHz, Cr = 4/5, Sf = 128chips/symbol, CRC on

  // The default transmitter power is 13dBm, using PA_BOOST.
  // If you are using RFM95/96/97/98 modules which uses the PA_BOOST transmitter pin, then
  // you can set transmitter powers from 5 to 23 dBm:
  rf95.setTxPower(23, false);
}

void setFlags(bool reqAck, bool isAck, bool isKey) {
    if (reqAck) {
        manager.setHeaderFlags(BITMASK_ACK_REQ);
    } else {
        manager.setHeaderFlags(RH_FLAGS_NONE, BITMASK_ACK_REQ);
    }
    if (isAck) {
        manager.setHeaderFlags(BITMASK_IS_ACK);
    } else {
        manager.setHeaderFlags(RH_FLAGS_NONE, BITMASK_IS_ACK);
    }
    if (isKey) {
        manager.setHeaderFlags(BITMASK_IS_KEY);
    } else {
        manager.setHeaderFlags(RH_FLAGS_NONE, BITMASK_IS_KEY);
    }
}

bool hasFlag(uint8_t bitmask) {
    uint8_t flag = manager.headerFlags();
    return (bool) flag & bitmask;
}

bool getRadioMessage() {
    if (manager.available()) {
        Serial.println("rf95 available");
        // check if there is a message for us 
        Serial.println(manager.headerTo()); //255
        Serial.println(manager.headerFrom());//255
        Serial.println(manager.headerId());//0
        Serial.println(manager.headerFlags());//0
        Serial.println(manager.thisAddress());
        uint8_t len = sizeof(g_lastMessage);
        if (manager.recvfrom(g_lastMessage, &len)) {
            Serial.print(hasFlag(BITMASK_ACK_REQ));
            Serial.print(hasFlag(BITMASK_IS_ACK));
            Serial.print(hasFlag(BITMASK_IS_KEY));
            Serial.println("");
            return true;
        }
    }
    return false;
}

bool sendRadioMessage(char* buf, int len, int address = 255, int timeout=1000) {
    manager.sendto(buf, len, address);
    return manager.waitPacketSent(timeout);
}

void loop() {
    delay(500);
    rf95.setModeRx();
    if (getRadioMessage()) {
        Serial.println(g_lastMessage);
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
}
