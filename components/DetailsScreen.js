import React from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, FlatList, ToastAndroid, NativeModules, TouchableOpacity, ImageBackground } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Databse from './Database';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import AppContext from './AppContext';
import { Menu, MenuOptions, MenuTrigger, MenuOption } from 'react-native-popup-menu';
import { Entypo, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import defaultBackgroundImageLight from '../assets/defaultBackgroundImageLight.png';
import defaultBackgroundImageDark from '../assets/defaultBackgroundImageDark.png';

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
  const defaultBackgroundImage = scheme === 'dark' ? defaultBackgroundImageDark : defaultBackgroundImageLight;
  const defaultBackgroundImageUri = scheme === 'dark' ? defaultBackgroundImageDark.png : defaultBackgroundImageLight.png;

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

    Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const speechStartHandler = (e) => {
    console.log('speechStart successful', e);
  };

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
    UsbSerial.write(text, 1, 12, 0);
    setMessages([...messages, { id: messageSize + 1, message: text, time: Date.now() }]);
    Databse.insertMessage(route.params.id, text, Date.now(), 1);
    this.textInput.clear();
  };

  const speechToText = () => {
    if (!isListening) {
      setIsListening(true);
      try {
        Voice.start('en-US');
      } catch (error) {
        console.log('error', error);
      }
    } else {
      setIsListening(false);
      Voice.stop();
    }
  };

  const setDefaultBackground = async () => {
    try {
      await AsyncStorage.removeItem('backgroundImage');
    } catch (error) {
      console.log('Error removing background image:', error);
    }

    setBackgroundImage(defaultBackgroundImageUri);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Entypo name="dots-three-vertical" size={20} color={scheme === 'dark' ? 'white' : 'black'} />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={openGallery}>
              <Text style={styles.menuOptionText}>Wallpaper</Text>
            </MenuOption>
            <MenuOption onSelect={setDefaultBackground}>
              <Text style={styles.menuOptionText}>Default Wallpaper</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      ),
    });
  });
  
  React.useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const storedImageUri = await AsyncStorage.getItem('backgroundImage');
        if (storedImageUri) {
          setBackgroundImage(storedImageUri);
        }
      } catch (error) {
        console.log('Error retrieving background image:', error);
      }
    };
  
    fetchBackgroundImage();
  }, []); 

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permission denied to access media library');
      return;
    }
  
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      base64: true,
    };
  
    const result = await ImagePicker.launchImageLibraryAsync(options);
  
    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      setBackgroundImage(selectedImageUri);
      try {
        await AsyncStorage.setItem('backgroundImage', selectedImageUri);
      } catch (error) {
        console.log('Error saving background image:', error);
      }
    }
  };  

  const textToSpeech = (text) => {
    Speech.speak(text);
  };

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
    <TouchableOpacity onPress={() => textToSpeech(item.message)}>
      <Item item={item} />
    </TouchableOpacity>
  );

  let scrollRef = React.useRef(null);

  return (
    <ImageBackground
      source={backgroundImage ? { uri: backgroundImage } : defaultBackgroundImage}
      style={[
        styles.container,
        {
          backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
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
          placeholder="Message"
          placeholderTextColor={scheme === 'dark' ? '#ffffff' : '#000000'}
          ref={(input) => {
            this.textInput = input;
          }}
          onChangeText={(text) => setText(text)}
        />
        <Pressable style={styles.sendButton}>
          {text && text.length > 0 && (
            <Ionicons
              name="send"
              size={22}
              color="white"
              style={styles.icon}
              onPress={() => sendMessages(text)}
            />
          )}
          {!text && (
            <FontAwesome
              name="microphone"
              size={24}
              color="white"
              style={styles.icon}
              onPress={() => speechToText()}
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
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
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
  menuOptionText: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
});

export default DetailsScreen;
