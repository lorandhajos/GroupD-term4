import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Databse from './Database';
import * as SecureStore from 'expo-secure-store';
import * as eccrypto from 'eccrypto';

function FinishSetup(navigation) {
  navigation.dispatch(() => {
    return CommonActions.reset({
      routes: [
        { name: 'Home' },
      ],
      index: 0,
    });
  });
}

function generatePrivateKey() {
  const privKey = eccrypto.generatePrivate();
  SecureStore.setItemAsync("privKey", privKey.toString('hex'));
}

const setInitialized = async (value) => {
  try {
    await AsyncStorage.setItem('isInitialized', value)
  } catch (e) {
    console.error(e);
  }
}

function SetupScreen({navigation}) {
  SecureStore.getItemAsync("privKey").then((value) => {
    if (value == null) {
      console.log("No private key found, generating new one");
      try {
        generatePrivateKey();
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Private key found");
      FinishSetup(navigation);
    }
  });

  const image = require('../assets/setupImage.png');

  Databse.initDatabase();

  setInitialized("1");

  return (
    <View style={styles.container}>
      <View style={styles.setupScreen}>
        <ImageBackground source={image} resize='cover' style={styles.setupImage}>
        <Text style={styles.chooseUsername}>Choose Username</Text>
            <TextInput
                style={styles.input}
                id='message'
                placeholder="Enter Username"
                value={message}
                onChange={(event) => setMessage(event)}
            />
            <Pressable style={styles.communicationButton} disabled={!message} onPress={() => FinishSetup(navigation)}>
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
    width: '100%',
  },
  setupImage: {
    flex: 1,
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
    marginVertical: '10%',
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
});

export default SetupScreen;
