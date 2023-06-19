import React from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, FlatList, ToastAndroid, NativeModules, TouchableOpacity, ImageBackground } from 'react-native';
import { FontAwesome, Ionicons, Entypo } from '@expo/vector-icons';
import * as Databse from './Database';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import AppContext from './AppContext';
import { Menu, MenuOptions, MenuTrigger, MenuOption } from 'react-native-popup-menu';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { UsbSerial } = NativeModules;

function formatTime(time) {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  if (date.toDateString() === new Date().toDateString()) {
    // if date is today, return time
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  } else if (date.toDateString() === new Date(Date.now() - 86400000).toDateString()) {
    // if date is yesterday, return yesterday
    return `Yesterday`;
  } else {
    // else return date
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
}

function DetailsScreen({route, navigation}) {
  const context = React.useContext(AppContext);
  const [scheme, setScheme] = React.useState(context.scheme);
  const [messages, setMessages] = React.useState('');
  const [messageSize, setMessageSize] = React.useState('');
  const [text, setText] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [backgroundImage, setBackgroundImage] = React.useState('');

  React.useEffect(() => {
    Databse.getMessages(route.params.id, setMessages);
    Databse.getMessageSize(setMessageSize);
  }, [messages]);

  React.useEffect(() => {
    navigation.setOptions({
      title: route.params.name,
    });
  }, [navigation]);

  React.useEffect(() => {
    setScheme(context.scheme);
  }, [context.scheme]);

  React.useEffect(() => {
    UsbSerial.openDevice();

    if (UsbSerial.isDeviceConnected()) {
      ToastAndroid.show('Radio Module connected!', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show('Radio Module not connected!', ToastAndroid.SHORT);
    }

    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const speechEndHandler = (e) => {
    setIsListening(false);
    console.log('stop handler', e);
  };

  const speechResultsHandler = (e) => {
    const text = e.value[0];
    console.log('speechResults successful', e);
    setText(text);
    this.textInput.setNativeProps({ text });
  };

  const sendMessages = (text) => {
    UsbSerial.sendMessage(text, 12);
    setMessages([...messages, { id: messageSize + 1, message: text, time: Date.now() }]);
    Databse.insertMessage(route.params.id, text, Date.now(), 1);
    this.textInput.clear();
  };

  const startListening = () => {
    if (!isListening) {
      setIsListening(true);
      try {
        Voice.start('en-US');
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  const stopListening = () => {
    setIsListening(false);
    Voice.stop();
  };

  const selectImage = () => {
    ImagePicker.requestMediaLibraryPermissionsAsync().then((result) => {
      if (result.status !== 'granted') {
        console.log('Permission denied to access media library');
        return;
      }
  
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        base64: true,
      };
    
      ImagePicker.launchImageLibraryAsync(options).then((result) => {
        if (!result.canceled) {
          AsyncStorage.setItem('backgroundImage', result.assets[0].uri);
          setBackgroundImage(result.assets[0].uri);
        }
      });
    });
  }

  const removeBackground = () => {
    AsyncStorage.removeItem('backgroundImage').then(() => {
      setBackgroundImage('');
    });
  };

  React.useLayoutEffect(() => {
    AsyncStorage.getItem('backgroundImage').then((value) => {
      if (value) {
        setBackgroundImage(value);
      }
    });
  }); 

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Entypo name='dots-three-vertical' size={20} color={scheme === 'dark' ? 'white' : 'black'} />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption style={styles.menuOptions} onSelect={() => selectImage()} text='Wallpaper' />
            <MenuOption style={styles.menuOptions} onSelect={() => removeBackground()} text='Remove Wallpaper' />
          </MenuOptions>
        </Menu>
      ),
    });
  });

  const Item = ({ item }) => (
    <>
      {item.type == 1 && (
        <View style={[styles.messageBox, styles.messageBoxSent]}>
          <Text style={[styles.message, styles.messageSent]}>{item.message}</Text>
          <Text style={[styles.time, styles.messageSent]}>{formatTime(item.time)}</Text>
        </View>
      )}
      {item.type == 0 && (
        <View
          style={[
            styles.messageBox,
            { backgroundColor: scheme === 'dark' ? '#7a7a7a' : '#ffffff' },
          ]}
        >
          <Text
            style={[
              styles.message,
              { color: scheme === 'dark' ? 'white' : 'black' },
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.time,
              { color: scheme === 'dark' ? 'white' : 'black' },
            ]}
          >
            {formatTime(item.time)}
          </Text>
        </View>
      )}
    </>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => Speech.speak(item.message)}>
      <Item item={item} />
    </TouchableOpacity>
  );

  let scrollRef = React.useRef(null);

  return (
    <ImageBackground
      source={backgroundImage ? { uri: backgroundImage } : null}
      style={[
        styles.container,
        {
          backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5',
        },
      ]}
    >
      <View style={styles.messagesContainer}>
        {messages && (
          <FlatList
            data={messages}
            renderItem={renderItem}
            ref={(it) => (scrollRef.current = it)}
            keyExtractor={(item) => item.id}
            maxToRenderPerBatch={10}
            windowSize={10}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          multiline={true}
          style={[
            styles.input,
            {
              backgroundColor: scheme === 'dark' ? '#7a7a7a' : '#ffffff',
              color: scheme === 'dark' ? '#ffffff' : '#000000',
            },
          ]}
          maxLength={250}
          placeholder='Message'
          placeholderTextColor={scheme === 'dark' ? '#ffffff' : '#000000'}
          ref={(input) => {
            this.textInput = input;
          }}
          onChangeText={(text) => setText(text)}
        />
        <Pressable style={styles.sendButton}>
          {text && text.length > 0 && (
            <Ionicons
              name='send'
              size={22}
              color='white'
              style={styles.icon}
              onPress={() => sendMessages(text)}
            />
          )}
          {!text && !isListening && (
            <FontAwesome
              name='microphone'
              size={24}
              color='white'
              style={styles.icon}
              onPress={() => startListening()}
            />
          )}
          {isListening && (
            <FontAwesome
              name='stop'
              size={24}
              color='white'
              style={styles.icon}
              onPress={() => stopListening()}
            />
          )}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#3385ff',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
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
  icon: {
    width: 24,
    textAlign: 'center',
  },
  menuOptions: {
    padding: 12,
  },
});

export default DetailsScreen;
