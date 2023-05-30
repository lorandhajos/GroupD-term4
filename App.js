import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, ImageBackground, View, Button, NativeModules, TextInput, FlatList, Pressable, TouchableHighlight } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Asset, useAssets } from 'expo-asset';

const {UsbSerial} = NativeModules;
const Stack = createNativeStackNavigator();

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

function HomeScreen({navigation}) {
  return (
    <View style={styles.container}>
       <FlatList
        data={contacts}
        renderItem={({item}) => <Item item={item} navigation={navigation} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

function DetailsScreen({route}) {
  const { message } = route.params;
  return (
    <View style={styles.container}>
      <View style={styles.messagesContainer}>
        <Text key={1} style={styles.message}>
          {message}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message"
        />
        <Pressable style={styles.sendButton}>
          <Ionicons name="send" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

function FirstTimeSetupScreen({navigation}) {

  const image = require('./assets/setupImage.png');

  return (
    <View style={styles.setupScreen}>
      <ImageBackground source={image} resize='cover' style={styles.setupImage}>
        <Pressable style={styles.communicationButton} onPress={ () => navigation.navigate('Home')}>
          <Text style={styles.startCommunication}>Start communication</Text>
        </Pressable>
        <Pressable style={styles.settingButton} onPress={ () => navigation.navigate('Home')}>
          <Text style={styles.startCommunication}>Settings</Text>
        </Pressable>
        <Text style={styles.inspirationQuote}>“JOBS FILL YOUR POCKETS, BUT ADVENTURES FILL YOUR SOUL.”</Text>
        <Pressable style={styles.sosButton} onPress={() =>
           <Button title='Send'/>}>
          <Text style={styles.sosText}>SOS</Text>
        </Pressable>
      </ImageBackground>

    </View>
  );
}

function App() {
  
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{animation: "slide_from_right"}}>
          <Stack.Screen name="Setup Screen" component={FirstTimeSetupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} options={({ route }) => ({ title: route.params.name })}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  message: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3385ff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
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

export default App;