import React from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable } from 'react-native';
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
  const image = require('../assets/setupImage.png');

  return (
    <View style={styles.container}>
      <View style={styles.setupScreen}>
        <ImageBackground source={image} resize='cover' style={styles.setupImage}>
          <Pressable style={styles.communicationButton} onPress={() => FinishSetup(navigation)}>
            <Text style={styles.startCommunication}>Start communication</Text>
          </Pressable>
          <Text style={styles.inspirationQuote}>“JOBS FILL YOUR POCKETS, BUT ADVENTURES FILL YOUR SOUL.”</Text>
          <Pressable style={styles.sosButton}>
            <Text style={styles.sosText}>SOS</Text>
          </Pressable>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  time: {
    height: '100%',
  },
  setupScreen:{
    flex: 1,
  },
  setupImage: {
    flex: 1,
  },
  communicationButton:{
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
    height: '5%',
    width: '60%',
    marginLeft:'20%',
    marginVertical: '10%',
  },
  settingButton:{
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
    height: '5%',
    width: '60%',
    marginLeft:'20%',
  },
  startCommunication:{
    fontWeight: 'bold',
    fontSize: 20,
  },
  inspirationQuote: {
    flex: 1,
    color: 'white',
    alignItems: 'center',
    fontSize: 28,
    position: 'absolute',
    textAlign: 'center',
    width: '50%',
    marginLeft:'20%',
    marginTop: 300,
    
  },
  sosButton:{
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    height: 100,
    width: '30%',
    marginVertical: '100%',
    marginLeft: 30,
    marginLeft:'35%',
    backgroundColor: 'red',
    
  },
  sosText:{
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  }
});

export default SetupScreen;
