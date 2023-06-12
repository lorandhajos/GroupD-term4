#include <SPI.h>
#include <RH_RF95.h>
#include <RHDatagram.h>

#define RFM95_CS    8
#define RFM95_INT   7
#define RFM95_RST   4

#define RF95_FREQ 915.0


constexpr int comnandSend = 1;
constexpr int comnandChangeMode = 2;
constexpr int conmandChangeFreq = 4;
constexpr int conmandSOS = 3;

constexpr int SOStoON = 1;
constexpr int SOStoOFF = 0;

const uint8_t BITMASK_ACK_REQ = 0b00000001;
const uint8_t BITMASK_IS_ACK =  0b00000010;
const uint8_t BITMASK_IS_KEY =  0b00000100;

constexpr int modeSleep = 5;
constexpr int modeStandBy = 6;
constexpr int modeListen = 7;
constexpr int modeSend = 8;

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

int count = 0;

RH_RF95 rf95(RFM95_CS, RFM95_INT);
RHDatagram manager(rf95, 13);
void setup(){

  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);

  while(!Serial){
    delay(1);
  }

  // wait until serial console is open
  Serial.begin(115200);
  delay(100);

  rf95.init();

  rf95.setFrequency(RF95_FREQ);

  while(!manager.init()){
    delay(1);
  }
  rf95.setTxPower(23, false);
}
void loop(){
  count = 0;
  if(checkConectioin()){
    if(checkSerial() && count == 0){
      count++;
      char buffer[250]; //maximum length of mesage 240
      int len = Serial.readBytes(buffer, 250);
      delay(100);
      int action = conversion(buffer[0]);

      if(action == 1 && len>6 && count==1){

        String tmp;
        for(int i=1; i<4; i++){
          tmp.concat(buffer[i]);
        }
        int address = tmp.toInt();

        int flag = conversion(buffer[4]);

        char loadRead[250];
        for(int i=5; i<len-1; i++){
          loadRead[i-5]=buffer[i];
        }
        int Plength = len-5;
        char payload[Plength];
        for(int i=0; i<Plength-1;i++){
          payload[i] = loadRead[i];
          Serial.println(payload[i]);
        }
        payload[Plength-1]=0;
        
      }
      /*
      else if(action == comnandChangeMode && count == 1){
        count++;
        int mode = conversion(buffer[1]);
        
        if(mode==modeSleep){
          rf95.sleep();
        }
        if(mode==modeStandBy){
          rf95.setModeIdle();
        }
        if(mode==modeListen){
          rf95.setModeRx();
        }
        if(mode==modeSend){
          rf95.setModeTx();
        }
        else{
          throwErrorToPhone(errorFailedModeChange);
        }
      }
      else if(action == conmandSOS && count == 1){
        count++;
        int ONorOFF = conversion(buffer[1]);
        if(ONorOFF == SOStoON && count==2){
          //set SOS to on
        }
        else if(ONorOFF == SOStoOFF && count==2){
          //set SOS to off
        }
        else{
          throwErrorToPhone(errorUnexpectedCommand);
        }
      }

      else if(action == conmandChangeFreq && count == 1 && len>2){
        count++;
        String tmp;
        for(int i=1; i<4; i++){
          tmp.concat(buffer[i]);
        }
        int freq = tmp.toInt();
          if(count==2 && freq>700 && freq<1000){
            rf95.setFrequency(freq);
          }
      }
      */
      else{
        count++;
        throwErrorToPhone(errorUnexpectedCommand);
      }
    }
  }
  else{
    //recieving?
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
  Serial.write(errorType);
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

void restart(){
  digitalWrite(RFM95_RST, LOW);
  delay(10);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);
}