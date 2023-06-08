#include <SPI.h>
#include <RH_RF95.h>
#include <Arduino.h>

#define RFM95_CS    8
#define RFM95_INT   7
#define RFM95_RST   4

//array{comand, adres, flags, message}
//arrayElse{comand, setToWhat}

constexpr int comnandSend = 1;
constexpr int comnandChangeMode = 3;
constexpr int conmandSOS = 9;
constexpr int conmandChangeFreq = 27;

constexpr int flagEmpty = 2;
constexpr int flagSnedConf = 4;
constexpr int flagNoConf = 8;

constexpr int modeSleep = 5;
constexpr int modeStandBy = 6;
constexpr int modeListen = 7;
constexpr int modeSend = 8;

constexpr int maxRestart = 50;

constexpr int errorUnexpected = 40;
constexpr int errorFailedStart = 41;
constexpr int errorFailedToSend = 42;
constexpr int errorFailedConnect = 43;
constexpr int errorFailedSerial = 44;
constexpr int errorFailedChangeFreq = 45;
constexpr int errorFailedModeChange = 46;
constexpr int errorUnexpectedCommand = 47;

const int ASCInum[] = {10, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57};
const int UTFnum[] = {-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9};

int LED = 13;

int count = 0;

RH_RF95 rf95(RFM95_CS, RFM95_INT);

void setup(){
  int restarts = 0;
  pinMode(LED, OUTPUT);

  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);

  while(!Serial){
    restarts++;
    delay(1);
    if(restarts>maxRestart){
      throwErrorToPhone(errorFailedSerial);
      restart();
    }
  }

  // wait until serial console is open
  Serial.begin(115200);
  delay(100);

  restarts = 0;
  while(!rf95.init()){
    restarts++;
    delay(1);
    if(restarts>maxRestart){
      throwErrorToPhone(errorFailedStart);
      restart();
    }
  }
}
void loop(){
  //count = 0;
  if(checkConectioin()){
    if(checkSerial() && count == 0){
      byte buffer = Serial.read();
      int action = conversion(buffer);
      Serial.println(action);

      if(action == comnandSend && count == 0){
        Serial.println("We recieved comand send");
        count++;
      }

      else if(action == comnandChangeMode && count == 0){
        Serial.println("We recieved mode change");
        count++;
      }

      else if(action == conmandSOS && count == 0){
        Serial.println("We recieved SOS");
        count++;
      }

      else if(action == conmandChangeFreq && count == 0){
        Serial.println("We recieved frequency");
        count++;
      }

      else if(count == 0 && action == -2){
        Serial.println("We recieved inapropriate");
        count++;
        throwErrorToPhone(errorUnexpectedCommand);
      }
    }
  }
  else{

  }
}

bool checkSerial(){
  if(Serial.available()>0){
    return true;
  }
  return false;
}

int conversion(int buffer){
  for(int i = 0; i<11; i++){
    if(buffer == ASCInum[i]){
      buffer = UTFnum[i];
      return buffer;
    }
  }
  return -2;
}

//void determineComand(){
//  if(checkSerial()){
//    for()
//  }
//}

void setFrequency(){

}

void send(){

}
void SOS(){

}

bool checkConectioin(){
  if(Serial){
    return true;
  }
  return false;
}

void throwErrorToPhone(int errorType){

}

void restart(){
  digitalWrite(RFM95_RST, LOW);
  delay(10);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);
}