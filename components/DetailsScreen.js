import React from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, FlatList, ToastAndroid, NativeModules } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Databse from './Database';

const { UsbSerial } = NativeModules;

function formatTime(time) {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

function DetailsScreen({route, navigation}) {
  const [messages, setMessages] = React.useState();
  const [messageSize, setMessageSize] = React.useState();
  const [text, setText] = React.useState();

  React.useEffect(() => {
    Databse.getMessages(route.params.id, setMessages);
  }, [messages]);

  React.useEffect(() => {
    Databse.getMessageSize(setMessageSize);
  }, [messages])

  React.useEffect(() => {
    navigation.setOptions({
      title: route.params.name,
    });
  }, [navigation]);

  React.useEffect(() => {
    UsbSerial.openDevice();

    if (UsbSerial.isDeviceConnected()) {
      ToastAndroid.show('Radio Module connected!', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show('Radio Module not connected!', ToastAndroid.SHORT);
    }
  }, []);

  const sendMessages = (text) => {
    UsbSerial.write(text);
    setMessages([...messages, {id: messageSize+1, message: text, time: Date.now()}]);
    Databse.insertMessage(route.params.id, text, Date.now(), 1);
    this.textInput.clear();
  }

  const Item = ({item}) => (
    <>
      {item.type == 1 && (
        <View style={[styles.messageBox, styles.messageBoxSent]}>
          <Text style={[styles.message, styles.messageSent]}>{item.message}</Text>
          <Text style={[styles.time, styles.messageSent]}>{formatTime(item.time)}</Text>
        </View>
      )}
      {item.type == 0 && (
        <View style={styles.messageBox}>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{formatTime(item.time)}</Text>
        </View>
      )}
    </>
  );
  
  const renderItem = ({item}) => (<Item item={item} />);

  let scrollRef = React.useRef(null)
  
  return (
    <View style={styles.container}>
      <View style={styles.messagesContainer}>
        {messages && (
          <FlatList
            data={messages}
            renderItem={renderItem}
            ref={(it) => (scrollRef.current = it)}
            keyExtractor={item => item.id}
            maxToRenderPerBatch={10}
            windowSize={10}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({animated: false})
            }
          />
        )}
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Message" ref={input => { this.textInput = input }}
          onChangeText={(text) => setText(text)} />
        <Pressable style={styles.sendButton}>
          <Ionicons name="send" size={24} color="white" onPress={() => sendMessages(text)}/>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
  },
  messageBox: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    margin: 10,
  },
  messageBoxSent: {
    alignSelf: 'flex-end',
    backgroundColor: '#3385ff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3385ff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'right',
  },
  message: {
    fontSize: 16,
  },
  messageSent: {
    color: '#ffffff',
  },
});

export default DetailsScreen;
