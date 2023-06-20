import React from 'react';
import { StyleSheet, Text, View, NativeModules, FlatList, Pressable, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons'; 
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { CommonActions } from '@react-navigation/native';
import * as Database from './Database';
import AppContext from './AppContext';
import * as Location from 'expo-location';

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

const Item = ({item, navigation, scheme}) => (
  <View style={styles.item}>
    <Pressable style={styles.contact} onPress={() => navigation.navigate('Details', {id: item.id, name: item.name})}>
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
  const [location, setLocation] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState(null);

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

  React.useLayoutEffect(() => {
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
  });

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
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const latitude = JSON.stringify(location.coords.latitude);
    const longitude = JSON.stringify(location.coords.longitude);
    const altitude = JSON.stringify(location.coords.altitude);
    const locationText = `Please help me, my coordinates are: Latitude ${latitude} Longitude ${longitude} Altitude ${altitude}`
    console.log(locationText);
  };

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5' }]}>
      {messages && (
        <FlatList
          data={messages}
          renderItem={({ item }) => <Item item={item} navigation={navigation} scheme={scheme} />}
          keyExtractor={item => item.id}
        />
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
});

export default HomeScreen;
