import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput, Dimensions } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Databse from './Database';
import * as SecureStore from 'expo-secure-store';
import * as eccrypto from 'eccrypto';

const FinishSetup = (navigation, name) => {
  try {
    AsyncStorage.getItem('name').then((value) => {
      if (value == null) {
        AsyncStorage.setItem('name', name.toString());
      }
    });
  } catch (error) {
    console.error(error);
  }
  
  Databse.initDatabase();

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

function SetupScreen({navigation}) {
  const [name, setName] = React.useState();

  React.useEffect(() => {
    SecureStore.getItemAsync("privKey").then((value) => {
      if (value == null) {
        console.log("No private key found, generating new one");
        try {
          const privKey = eccrypto.generatePrivate();
          SecureStore.setItemAsync("privKey", privKey.toString('hex'));
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log("Private key found");
        FinishSetup(navigation, name);
      }
    });
  }, []);

  const image = require('../assets/setupImage.png');

  return (
    <View style={styles.container}>
      <View style={styles.setupScreen}>
        <ImageBackground source={image} resize='cover' style={styles.setupImage}>
          <Text style={styles.chooseUsername}>Choose Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Username"
            onChange={(text) => setName(text)}
          />
          <Pressable style={styles.communicationButton} disabled={!name} onPress={() => FinishSetup(navigation, name)}>
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
