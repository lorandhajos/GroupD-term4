import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import { HomeScreen, DetailsScreen } from './components'

const Stack = createNativeStackNavigator();

function ChangeRegionScreen({navigation}){
  const [selectedLanguage, setSelectedLanguage] = useState();
  return (
    <View>
      <Text>
        {'Select Region'}
      </Text>
      <Picker
     selectedValue={selectedLanguage}
  onValueChange={(itemValue, itemIndex) =>
    setSelectedLanguage(itemValue)
  }>
  <Picker.Item label="Europe" value="EU" />
  <Picker.Item label="Asia" value="AS" />
  <Picker.Item label="America" value="AM" />
  </Picker>
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
          <Stack.Screen name="ChangeRegion" component={ChangeRegionScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
