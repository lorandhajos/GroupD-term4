#include <SPI.h>
#include <RH_RF95.h>

#define RFM95_CS    8
#define RFM95_INT   7
#define RFM95_RST   4

//array{comand, adres, flags, message}
//arrayElse{comand, setToWhat}

constexpr int comandSned = 1;
constexpr int comandChangeMode = 3;
constexpr int comandSOS = 9;

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

int LED = 13;

void setup(){
  int restarts = 0;
  pinMode(LED, OUTPUT);
  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);

  while (!Serial){
    restart++;
    delay(1);
    if(restart>maxRestart){
      trhowErrorToPhone(errorFailedSerial);
      restart()
    }
  }

  // wait until serial console is open, remove if not tethered to computer
  Serial.begin(115200);
  delay(100);

  restarts = 0;
  while(!rf9.init()){
    restart++;
    delay(1);
    if(restart>maxRestart){
      trhowErrorToPhone(errorFailedStart);
      restart()
    }
  }
}
void loop(){
  if(checkConectioin()){
    if(checkSerial()){
          //main
    }
  }
  else{

  }






  //digitalWrite(LED, LOW);
  //if(Serial.available()>0){
    //digitalWrite(LED, HIGH);
    //delay(100);
  //}
}

bool checkSerial(){
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