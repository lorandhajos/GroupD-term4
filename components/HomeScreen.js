import React from 'react';
import { StyleSheet, Text, View, NativeModules, FlatList, Pressable, Alert, ToastAndroid } from 'react-native';
import { Entypo } from '@expo/vector-icons'; 
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { CommonActions } from '@react-navigation/native';
import * as Database from './Database';
import AppContext from './AppContext';
import * as Location from 'expo-location';
import CryptoES from 'crypto-es';

const { UsbSerial } = NativeModules;

const JsonFormatter = { 
  stringify: function (cipherParams) { // create json object with ciphertext
    const jsonObj = { ct: cipherParams.ciphertext.toString(CryptoES.enc.Base64) }; // optionally add iv and salt
    if (cipherParams.iv) {
      jsonObj.iv = cipherParams.iv.toString();
    }
    if (cipherParams.salt) {
      jsonObj.s = cipherParams.salt.toString();
    }
    // stringify json object
    return JSON.stringify(jsonObj);
  },
  parse: function (jsonStr) { // parse json string
    const jsonObj = JSON.parse(jsonStr); // extract ciphertext from json object, and create cipher params object
    const cipherParams = CryptoES.lib.CipherParams.create(
      { ciphertext: CryptoES.enc.Base64.parse(jsonObj.ct) },
    ); // optionally extract iv and salt
    if (jsonObj.iv) {
      cipherParams.iv = CryptoES.enc.Hex.parse(jsonObj.iv)
    }
    if (jsonObj.s) {
      cipherParams.salt = CryptoES.enc.Hex.parse(jsonObj.s)
    }
    return cipherParams;
  },
};

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

const Item = ({item, navigation, scheme}) => (
  <View style={styles.item}>
    <Pressable style={styles.contact} onPress={() => navigation.navigate('Details', {id: item.id, name: item.name, address: item.address, pubKey: item.pubKey})}>
      <Text style={[styles.name, {color: scheme === 'dark' ? 'white' : 'black'}]}>{item.name}</Text>
      <Text style={[styles.time, {color: scheme === 'dark' ? 'white' : 'black'}]}>{formatTime(item.time)}</Text>
      <Text style={[styles.message, {color: scheme === 'dark'  ?'white' : 'black'}]} numberOfLines={2}>{item.message}</Text>
    </Pressable>
  </View>
);

const HomeScreen = ({navigation}) => {
  const context = React.useContext(AppContext);
  const [scheme, setScheme] = React.useState(context.scheme);
  const [messages, setMessages] = React.useState();
  const [isDimmed, setIsDimmed] = React.useState(false);

  React.useEffect(() => {
    setScheme(context.scheme);
  }, [context.scheme]);

  React.useEffect(() => {
    Database.isInitialized().then((value) => {
      if (value) {
        Database.getHomeScreenData(setMessages);
      } else {
        navigation.dispatch(() => {
          return CommonActions.reset({
            routes: [
              { name: 'SetupScreen' },
            ],
            index: 0,
          });
        });
      }
    });
  }), [messages];

  React.useEffect(() => {
    UsbSerial.openDevice();

    Database.isInitialized().then((value) => {
      if (value) {
        if (UsbSerial.isDeviceConnected()) {
          Database.getAddress().then((address) => {
            console.log("Setting address: " + address);
            UsbSerial.setAddress(address);
          });

          ToastAndroid.show('Radio Module connected!', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Radio Module not connected!', ToastAndroid.SHORT);
        }
      }
    });
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const message = UsbSerial.read();

      if (Database.isInitialized()) {
        if (message) {
          const address = parseInt(message.substring(0, 3), 10);
          const flag = message.substring(3, 4);
          const text = message.substring(4);

          console.log(message);

          Database.getContactIdByAddress(address).then((id) => {
            if (id) {
              Database.getKeyFromContact(id).then((pubKey) => {
                if (pubKey) {
                  const decryptedText = CryptoES.AES.decrypt(text, pubKey, { format: JsonFormatter }).toString(CryptoES.enc.Utf8);

                  console.log(decryptedText);

                  Database.insertMessage(id, decryptedText, Date.now());
                }
              });
            }
          });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Entypo name='dots-three-vertical' size={20} color={scheme === 'dark' ? 'white' : 'black'} />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption style={styles.menuOptions} onSelect={() => navigation.navigate('Settings')} text='Settings' />
            <MenuOption style={styles.menuOptions} onSelect={() => navigation.navigate('Add Contact')} text='Add Contact' />
            <MenuOption style={styles.menuOptions} onSelect={() => navigation.navigate('QR Code')} text='QR Code' />
          </MenuOptions>
        </Menu>
      ),
    });
  }), [];

  const showAlert = () => {
    Alert.alert(
      'SOS Message',
      'Are you sure you want to send a message?',
      [
        {
          text: 'Yes',
          onPress: () => {
            setIsDimmed(false);
            UsbSerial.startSos();
            sendCoordinates();
          },
        },
        {
          text: 'No',
          onPress: () => {
            setIsDimmed(false);
            UsbSerial.stopSos();
            Alert.alert('SOS has been cancelled');
          },
        },
      ],
    );
  };

  const sendCoordinates = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const latitude = JSON.stringify(location.coords.latitude);
    const longitude = JSON.stringify(location.coords.longitude);
    const altitude = JSON.stringify(location.coords.altitude);
    const locationText = `Please help me, my coordinates are: Latitude ${latitude} Longitude ${longitude} Altitude ${altitude}`
    console.log(locationText);

    if (UsbSerial.isDeviceConnected()) {
      UsbSerial.startSos(locationText);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5' }]}>
      {messages && messages.length != 0 && (
        <FlatList
          data={messages}
          renderItem={({ item }) => <Item item={item} navigation={navigation} scheme={scheme} />}
          keyExtractor={item => item.id}
        />
      )}
      {!messages || messages.length == 0 && (
        <Text style={[styles.noMessagesText, { color: scheme === 'dark' ? 'white' : 'black' }]}>No contacts yet</Text>
      )}
      {isDimmed && <View style={styles.dimmedOverlay} />}
      <Pressable style={styles.sosButton} onPress={showAlert}>
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 999,
  },
  item: {
    padding: 8,
    marginVertical: 4,
    marginHorizontal: 8,
    height: 85,
  },
  contact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: '100%',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    width: '75%',
  },
  time: {
    width: '25%',
    textAlign: 'right',
  },
  message: {
    width: '85%',
  },
  menuOptions: {
    padding: 12,
    fontWeight: 'bold',
  },
  sosButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
    width: 70,
    borderRadius: 40,
    backgroundColor: 'red',
    elevation: 5,
  },
  sosText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dimmedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  floatButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    elevation: 5,
  },
  noMessagesText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
  },
});

export default HomeScreen;
