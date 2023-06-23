import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput, Dimensions } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Databse from './Database';
import * as SecureStore from 'expo-secure-store';
import { RSA } from 'react-native-rsa-native';

const finishSetup = (navigation, name, address) => {
  try {
    AsyncStorage.getItem('name').then((value) => {
      if (value == null) {
        AsyncStorage.setItem('name', name.toString());
      }
    });
  } catch (error) {
    console.error(error);
  }
  
  RSA.generateKeys(1024).then(keys => {
    const privKey = keys.private;

    try {
      SecureStore.getItemAsync('privKey').then((value) => {
        if (value == null) {
          console.log('No private key found, generating new one');
          SecureStore.setItemAsync('privKey', privKey);
        }
      });
    } catch (error) {
      console.error(error);
    }
  
    Databse.initDatabase();
  
    Databse.addContactInfo(name, address, keys.public);
  });

  try {
    AsyncStorage.setItem('isInitialized', "1")
  } catch (error) {
    console.error(error);
  }

  navigation.dispatch(() => {
    return CommonActions.reset({
      routes: [
        { name: 'Home' },
      ],
      index: 0,
    });
  });
}

function SetupScreen({ navigation }) {
  const [name, setName] = React.useState('');
  const [nameError, setNameError] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [addressError, setAddressError] = React.useState('');

  const validateName = (text) => {
    const regex = /^[a-zA-Z0-9_.\u{1F000}-\u{1FFFF}]+$/u;
    if (regex.test(text) || text.length === 0) {
      setName(text);
      setNameError('');
    } else {
      setName(text);
      setNameError('Only letters, underscores (_), emojis and full stops (.) are allowed.');
    }
  };

  const validateAddress = (number) => {
    const regex = /^[0-9]/;
    if (regex.test(number) || number.length === 0){
      setAddress(number);
      setAddressError('');
    } else {
      setAddress(number);
      setAddressError('It is only possible to enter three numbers.');
    }
  }

  const image = require('../assets/setupImage.png');

  const handleSubmit = () => {
    if (addressError === '' && nameError === '') {
      if (address >= 0 && address <= 255) {
        setAddressError('');
        finishSetup(navigation, name, address);
      } else {
        setAddressError('Address must be between 0 and 255.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.setupScreen}>
        <ImageBackground source={image} resize='cover' style={styles.setupImage}>
          <Text style={styles.chooseUsername}>Choose Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            onChangeText={validateName}
            value={name}
          />
          {nameError && (
            <Text style={styles.errorText}>{nameError}</Text>
          )}
          <TextInput
            maxLength={3}
            style={styles.addressInput}
            placeholder="Address"
            onChangeText={validateAddress}
            value={address}
          />
          {addressError && (
            <Text style={styles.errorAddress}>{addressError}</Text>
          )}
          <Pressable style={styles.communicationButton} disabled={!name} onPress={handleSubmit}>
            <Text style={styles.startCommunication}>Submit</Text>
          </Pressable>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  setupScreen:{
    flex: 1,
  },
  setupImage: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  chooseUsername:{
    fontSize: 30,
    marginBottom: 30,
    marginLeft: '17%',
    fontWeight: 'bold',
    marginTop: 200,
  },
  communicationButton:{
    backgroundColor: '#F55E5E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    width: '80%',
    height: 40,
    color: 'black',
    marginVertical: 15,
    marginLeft: '10%',
  },
  startCommunication:{
    fontWeight: 'bold',
    fontSize: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    width: '80%',
    height: 40,
    borderWidth: 1,
    padding: 10,
    marginLeft: '10%',
  },
  addressInput: {
    backgroundColor: '#f5f5f5',
    width: '80%',
    height: 40,
    borderWidth: 1,
    padding: 10,
    marginLeft: '10%',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginLeft: '10%',
    marginBottom: 10,
  },
  errorAddress: {
    color: 'red',
    marginLeft: '10%',
    marginBottom: 10,
  }
});

export default SetupScreen;