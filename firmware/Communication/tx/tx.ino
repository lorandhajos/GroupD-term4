#include <SPI.h>
#include <RH_RF95.h>
#include <RHDatagram.h>

#define RFM95_CS    8
#define RFM95_INT   7
#define RFM95_RST   4

int RF95_FREQ = 915.0;


constexpr int comnandSend = 1;
constexpr int comnandChangeMode = 2;
constexpr int conmandSOS = 3;
constexpr int conmandChangeFreq = 4;
constexpr int commandChangeAddress = 5;
constexpr int comandEmpty = 9;

constexpr int SOStoON = 1;
constexpr int SOStoOFF = 0;

const uint8_t BITMASK_ACK_REQ = 0b00000001;
const uint8_t BITMASK_IS_ACK =  0b00000010;
const uint8_t BITMASK_IS_KEY =  0b00000100;

constexpr int SOSflag = 8;

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

constexpr int defAddress = 1;
bool recvAddres = false;
bool sentRequest = false;
int curentAddress;


RH_RF95 rf95(RFM95_CS, RFM95_INT);
RHDatagram manager(rf95, defAddress);

void setup(){

  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);

  while(!Serial){
    delay(1);
  }

  // wait until serial console is open
  Serial.begin(115200);
  delay(100);

  digitalWrite(RFM95_RST, LOW);
  delay(10);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);

  rf95.init();
  manager.init();//the addres cant be 0

  rf95.setFrequency(RF95_FREQ);

  rf95.setTxPower(23, false);
}
void loop(){
  count = 0;
  if(checkConectioin()){
    if(!recvAddres && !sentRequest){
      delay(4000);
      char request[1] = "5";
      Serial.write(request);//As for I need address
      sentRequest=true;
    }
    if(checkSerial() && count == 0){
      count++;
      char buffer[250]; //maximum length of mesage 250
      int len = Serial.readBytes(buffer, 250);
      int action = conversion(buffer[0]);

      if(action == 1 && len>6 && count==1){

        String tmp;
        for(int i=1; i<4; i++){
          tmp.concat(buffer[i]);
        }
        int address = tmp.toInt();

        if(address>255){
          address = 254;
        }

        int id = random(1, 255);

        int flag = conversion(buffer[4]);

        char loadRead[250];
        for(int i=5; i<len-1; i++){
          loadRead[i-5]=buffer[i];
        }
        int Plength = len-5;
        char payload[Plength];
        for(int i=0; i<Plength-1;i++){
          payload[i] = loadRead[i];
        }
        payload[Plength-1]=0;
        manager.setHeaderId(id);
        setFlags(flag);
        Serial.println("Finished constructing payload");
        manager.sendto((uint8_t *)payload, Plength, address);//proggram crashes here after frequency change
        Serial.println("Snent the message");

        manager.waitPacketSent();
        delay(10);
        for(int i=0; i<5; i++){
          rf95.setModeRx();
          delay(1000);
          if(manager.available()){
            Serial.println("Waiting for message");
            char buf[10];
            if(manager.recvfrom(buf, 10)){
              Serial.println("Recieved something");
              int rcvID = manager.headerId();
              if(rcvID == id){
                Serial.println("Recieved conf");
                break;
              }
            }
          }
          else{
            manager.sendto((uint8_t *)payload, Plength, address);
            manager.waitPacketSent();
            Serial.println("Sent message again");
          }
        }
      }
      else if(action == commandChangeAddress && count == 1){
        recvAddres=true;
        String tmp;
        for(int i=1; i<4; i++){
          tmp.concat(buffer[i]);
        }
        int address = tmp.toInt();
        if(address>255){
          address = 254;
        }
        Serial.println(address);
        manager.setThisAddress(address);//address maximum 2 charachters
      }
      else if(action == conmandSOS && count == 1){
        count++;
        int status = conversion(buffer[1]);
        if(status == SOStoON && count==2){
          char SOSload[31]="SOS, I am in an emergency, SOS";
          SOSload[30]=0;
          while(true){
            manager.sendto((uint8_t *)SOSload, 31, 255);
            delay(10000);
            if(checkSerial()){
              break;
            }
          }
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
        Serial.println("Recieved frequency");
        int freq = tmp.toInt();
          if(count==2 && freq>430 && freq<999){
            rf95.setFrequency(freq);//Something unpresidented is a bout to happen NEEDS TO BE TESTED!!!!!!!!!!!!!!!!!!!!
            delay(1000);
            Serial.println(freq);//recreate module here
          }
          Serial.println("Finished changing frequency");
      }
      else if(action==comandEmpty && count==1){
        Serial.write(1);
      }
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

bool checkConnectioin(){
  if(Serial){
    return true;
  }
  return false;
}

void sendMessageToPhone(uint8_t from, uint8_t flag, char* message, int length){
  char messageToPhone[length+4];
  char fromConv[3]=(char)from;
  messageToPhone[lenght+3] = 0;
  for(int i=0; i<3;i++){
    messageToPhone[i]=fromConv[i];
  }
  for(int i=3; i<length+3; i++){
    messageToPhone[i]=message[i-3];
  }
  Serial.write(messageToPhone);
}

void throwErrorToPhone(int errorType){//make it char!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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

void setFlags(uint8_t flag) {
    // cleaning up all flags
    manager.setHeaderFlags(RH_FLAGS_NONE, BITMASK_ACK_REQ);
    manager.setHeaderFlags(RH_FLAGS_NONE, BITMASK_IS_ACK);
    manager.setHeaderFlags(RH_FLAGS_NONE, BITMASK_IS_KEY);
    // setting the new flag
    manager.setHeaderFlags(flag);
}


void restart(){
  digitalWrite(RFM95_RST, LOW);
  delay(10);
  digitalWrite(RFM95_RST, HIGH);
  delay(10);
}