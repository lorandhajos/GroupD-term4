import React, { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput } from 'react-native';
import { CommonActions } from '@react-navigation/native';

function FinishSetup(navigation) {
  navigation.dispatch(state => {
    return CommonActions.reset({
      routes: [
        { name: 'Home' },
      ],
      index: 0,
    });
  });
}

function SetupScreen({navigation}) {
  const [message, setMessage] = useState('');
  const image = require('../assets/setupImage.png');

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
