#include <SPI.h>
#include <RH_RF95.h>
#include <RHDatagram.h>

#define RFM95_CS    8
#define RFM95_INT   7
#define RFM95_RST   4

#define RF95_FREQ 915.0
RH_RF95 rf95(RFM95_CS, RFM95_INT);

const uint8_t BITMASK_ACK_REQ = 0b00000001;
const uint8_t BITMASK_IS_ACK =  0b00000010;
const uint8_t BITMASK_IS_KEY =  0b00000100;


RHDatagram manager(rf95, 13);
void setup() {
  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);

  Serial.begin(115200);
  while (!Serial) delay(1);
  delay(100);

  digitalWrite(RFM95_RST, LOW);
  delay(10);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);

  rf95.init();
  manager.init();
  rf95.setTxPower(23, false);
  rf95.setFrequency(RF95_FREQ);
}

void loop() {
  delay(1000);
  Serial.println("Cycle");
  char payload[20] = "Hello World";
  payload[19] = 0;

  setFlags(false, false, false);
  manager.setHeaderTo(12);
  manager.sendto((uint8_t *)payload, 20, 12);

  manager.waitPacketSent();
  delay(10);
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