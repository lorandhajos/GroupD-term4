#include <SPI.h>
#include <RH_RF95.h>

#define RFM95_CS    8
#define RFM95_INT   7
#define RFM95_RST   4

int LED = 13;

void setup(){
  pinMode(LED, OUTPUT);
  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);

  while (!Serial); // wait until serial console is open, remove if not tethered to computer
  Serial.begin(115200);
  delay(100);
  //Serial.println("Setup complete");
  
  // manual reset
  //digitalWrite(RFM95_RST, LOW);
  //delay(10);
  //digitalWrite(RFM95_RST, HIGH);
  //delay(10);
}
void loop(){
  digitalWrite(LED, LOW);
  if(Serial.available()>0){
    digitalWrite(LED, HIGH);
    delay(100);
  }
}

void checkSerial(){
  if(Serial.available()>0){
    return true;
  }
  return false;
}

//void determineComand(){
//  if(checkSerial()){
//    for()
//  }
//}

void send(){

}
void SOS(){

}