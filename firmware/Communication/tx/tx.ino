#include <SPI.h>
#include <RH_RF95.h>
#include <Arduino.h>

#define RFM95_CS    8
#define RFM95_INT   7
#define RFM95_RST   4

//char {comand, adres, flags, message}
//char {comand, setToWhat}

//comands - single digit
//flags - single digit
//addres - tripple digit

//set to what


constexpr int comnandSend = 1;
constexpr int comnandChangeMode = 2;
constexpr int conmandSOS = 3;
constexpr int conmandChangeFreq = 4;


constexpr int flagEmpty = 2;
constexpr int flagSnedConf = 4;
constexpr int flagNoConf = 8;


constexpr int modeSleep = 5;
constexpr int modeStandBy = 6;//fix this
constexpr int modeListen = 7;
constexpr int modeSend = 8;//FIx the code

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
  if(checkConectioin()){
    if(checkSerial() && count == 0){
      count++;
      char buffer[250]; //maximum length of mesage 240
      int len = Serial.readBytes(buffer, 250);
      int action = conversion(buffer[0]);
      if(action == comnandSend && count == 1 && len>4){
        String tmp;
        for(int i=1; i<4; i++){
          tmp.concat(buffer[i]);
        }
        int address = tmp.toInt();
        count++;
        if(count==2){
          int flag = conversion(buffer[4]);
          count++;
          if(count==3){
            String payload;
            for(int i=5; i<len-1; i++){
              payload.concat(buffer[i]);
            }
            //action
            //address
            //flag
            //payload
          }
        }
      }

      else if(action == comnandChangeMode && count == 0){
        
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

      else{
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
      return UTFnum[i];
    }
  }
  return -2;
}

String readPayload(){

}


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