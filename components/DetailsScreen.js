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

const Item = ({item}) => (
  <View style={styles.messageBox}>
    <Text style={styles.message}>{item.message}</Text>
    <Text style={styles.time}>{formatTime(item.time)}</Text>
  </View>
);

function DetailsScreen({route, navigation}) {
  const [messages, setMessages] = React.useState();
  const [text, setText] = React.useState();

  React.useEffect(() => {
    Databse.getMessages(route.params.id, setMessages);
  }, []);

  React.useEffect(() => {
    navigation.setOptions({
      title: route.params.name,
    });
  }, [navigation]);

  React.useEffect(() => {
    const value = UsbSerial.openDevice();

    console.log(value);

    if (UsbSerial.isDeviceConnected()) {
      ToastAndroid.show('Radio Module connected!', ToastAndroid.SHORT);
      console.log('Radio Module connected!');
    } else {
      ToastAndroid.show('Radio Module not connected!', ToastAndroid.SHORT);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.messagesContainer}>
        {messages && (
          <FlatList
            data={messages}
            renderItem={({item}) => <Item item={item} />}
            keyExtractor={item => item.id}
          />
        )}
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Message" onChangeText={(text) => setText(text)} />
        <Pressable style={styles.sendButton}>
          <Ionicons name="send" size={24} color="white" onPress={ () =>
            UsbSerial.write(text)
          }/>
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
});

export default DetailsScreen;
