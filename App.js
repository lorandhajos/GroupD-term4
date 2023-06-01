import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen, DetailsScreen, SetupScreen, ChangeRegion } from './components';
import { StyleSheet, Text, View, NativeModules, FlatList, Pressable, ToastAndroid, Alert } from 'react-native';
import {  Menu, MenuProvider, MenuOptions, MenuTrigger, renderers, MenuOption, } from 'react-native-popup-menu';


const Stack = createNativeStackNavigator();

function App() {
  return (
    <MenuProvider>
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{animation: "slide_from_right"}}>
          <Stack.Screen name="SetupScreen" component={SetupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} options={({ route }) => ({ title: route.params.name })}/>
          <Stack.Screen name="ChangeRegion" component={ChangeRegion}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </MenuProvider>
  );
}

export default App;