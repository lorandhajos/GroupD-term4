#include <SPI.h>
#include <RH_RF95.h>
#include <RHDatagram.h>

#define RFM95_CS    8 // 
#define RFM95_INT   7 // 
#define RFM95_RST   4 // 

// frequency value
int RF95_FREQ = 915.0;

// phone command opcodes
constexpr int commandSend = 1;
constexpr int commandChangeMode = 2;
constexpr int commandSOS = 3;
constexpr int commandChangeFreq = 4;
constexpr int commandChangeAddress = 5;
constexpr int commandEmpty = 9;

// signals to send SOS messages every set period
constexpr int SOStoON = 1;

//constexpr int SOSflag = 8;

// Used to change modes via command
constexpr int modeSleep = 5;
constexpr int modeStandBy = 6;
constexpr int modeListen = 7;
constexpr int modeSend = 8;

// error codes
constexpr int errorUnexpected = 41;
constexpr int errorFailedStart = 42;
constexpr int errorFailedToSend = 43;
constexpr int errorFailedConnect = 44;
constexpr int errorFailedSerial = 45;
constexpr int errorFailedChangeFreq = 46;
constexpr int errorFailedModeChange = 47;
constexpr int errorUnexpectedCommand = 48;

// used to convertMsgMsg from utf to ascii
const int ASCInum[] = {10, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57};
const int UTFnum[] = {-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9};

// used to ensure that no command is processed twice
int count = 0;

constexpr int defAddress = 1; // default address
bool recvAddres = false;      // did we get an address from the phone
int currentAddress;           // our actual address is stored here

// max messages to remember while not connected to the phone (can be increased at the risk of using up all available memory)
const int maxMessages = 20;

// C-style strings are probably more memory efficient, but an array of an array of chars is difficult to deal with
// convertMsg the String to char[] before sending it over the cable!
String g_msgArray[maxMessages];

int g_freeIndexMsg = 0;
bool g_msgArrayFull = false;

const uint8_t ClearFlagsMask = 0b00001111;
const uint8_t ReqAckMask     = 0b00000001;
const uint8_t IsAckMask      = 0b00000010;
const uint8_t IsKeyMask      = 0b00000100;
const uint8_t IsSOSMask      = 0b00001000;

// Radio driver
RH_RF95 rf95(RFM95_CS, RFM95_INT);
RHDatagram manager(rf95, 12);

void restart(){
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

bool checkSerial(){
  return (Serial.available()>0);
}

int conversion(int buffer){
  for(int i = 0; i<11; i++){
    if(buffer == ASCInum[i]){
      return UTFnum[i];
    }
  }
  return -2;
}

bool checkConnection() {
    if (Serial) {
        return true;
    } 
    return false;
}

void throwErrorToPhone(int errorType){
  String errorStr;
  char sendError[3];
  errorStr = String(errorType);
  errorStr.toCharArray(sendError, 3);
  sendError[2] = 0;
  Serial.write(sendError);
}

String convertMsg(uint8_t from, uint8_t flag, String message) {
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
            String convMessage = convertMsg(sender, msgFlags, lastMessage);
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
  manager.init();//the address cannot be 0
  rf95.setFrequency(RF95_FREQ);
  rf95.setTxPower(23, false);
}

void loop(){
  count = 0;
  if(checkConnection()){
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
        if(flag==1){
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
      else if(action == commandSOS && count == 1){
        count++;
        int status = conversion(buffer[1]);
        char SOSload[len-1];
        if(status == SOStoON && count==2){
          for(int i=2; i<len-1; i++){
            SOSload[i-2]=buffer[i];
          }
          SOSload[len-3]=0;
          setFlags(8);
          while(true){
            manager.sendto((uint8_t *)SOSload, len-2, 255);
            delay(1000);
            if(checkSerial()){
              break;
            }
          }
        }
        else{
          throwErrorToPhone(errorUnexpectedCommand);
        }
      }

      else if(action == commandChangeFreq && count == 1 && len>2){
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
      else if(action==commandEmpty && count==1){
        Serial.write(1);
      }
      else if(action == commandChangeMode && count == 1){
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
  getRadioMessage();
}
