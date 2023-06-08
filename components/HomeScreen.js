import React, { useState } from 'react';
import { StyleSheet, Text, View, NativeModules, FlatList, Pressable, ToastAndroid, Alert } from 'react-native';
import { Entypo, Feather } from '@expo/vector-icons'; 
import {  Menu, MenuOptions, MenuTrigger, MenuOption, } from 'react-native-popup-menu';
import { Button, Overlay } from 'react-native-elements';
import { Modal, Portal, PaperProvider } from 'react-native-paper';

const {UsbSerial} = NativeModules;

const contacts = [
  { id: 1, name: 'John Doe', lastMessage: 'Hello!', time: '11:00' },
  { id: 2, name: 'Jane Smith', lastMessage: 'This is a really long test message testing testing\ntesting test test test', time: '11:30' },
  { id: 3, name: 'Bob Johnson', lastMessage: 'Testing', time: '12:00' },
];

const Item = ({item, navigation}) => (
  <View style={styles.item}>
    <Pressable style={styles.contact} onPress={() => navigation.navigate('Details', {name: item.name, message: item.lastMessage})}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </Pressable>
  </View>
);

const HomeScreen = ({navigation}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Entypo name="dots-three-vertical" size={20} color="black" />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => navigation.navigate('ChangeRegion')} text='Settings'/>
          </MenuOptions>
        </Menu>
      ),
    });
  }, [navigation]);

  if (UsbSerial.isDeviceConnected()) {
    ToastAndroid.show('Radio Module connected!', ToastAndroid.SHORT);
  } else {
    ToastAndroid.show('Radio Module not connected!', ToastAndroid.SHORT);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={({item}) => <Item item={item} navigation={navigation} />}
        keyExtractor={item => item.id}
      />
      <PaperProvider>
        <Portal>
            <Menu style={styles.modalFloat}>
              <MenuTrigger>
                <View>
                  <Feather name="alert-octagon" size={50} color="black" />
                </View>
              </MenuTrigger>
              <MenuOptions>
                <PaperProvider>
                    <Pressable style={styles.sosButton} onPress={(showAlert)}>
                      <Text style={styles.sosText}>SOS</Text>
                    </Pressable>
                </PaperProvider>
              </MenuOptions>
            </Menu>
        </Portal>
      </PaperProvider>
    </View>
  );
}

const showAlert = () =>{
  Alert.alert(
    'SOS Message',
    'Are you sure you want to send message',
    [
      {
        text: 'Yes',
        onPress: () => Alert.alert('SOS has been sent'),
      },

      {
        text: 'No',
        onPress: () => Alert.alert('SOS has been cancelled'),
      },
    ],
  );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  menuContainer: {
    opacity: 2,
  },

  item: {
    padding: 8,
    marginVertical: 8,
    marginHorizontal: 8,
    height: 85,
  },
  contact: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'space-between',
    flexWrap: 'wrap',
    height: '100%',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  time: {
    height: '100%',
  },
  sosButton:{
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    width: '100%',
    backgroundColor: 'red',
  },
  sosText:{
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
  },
  modalFloat:{
    alignItems: 'flex-end',
    marginRight: 10,
    marginVertical: '20%',
  },
});

export default HomeScreen;