import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import { HomeScreen, DetailsScreen, SetupScreen } from './components';
import { Entypo } from '@expo/vector-icons';

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


function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{animation: "slide_from_right"}}>
          <Stack.Screen name="SetupScreen" component={SetupScreen} />
          <Stack.Screen name="Home" component={HomeScreen}
            options={{
              headerRight: () => (
                <Pressable onPress={() => navigation.navigate('ChangeRegion')}>
                  <Entypo name="dots-three-vertical" size={15} color="black" />
                </Pressable>
              ),
            }}/>
          <Stack.Screen name="Details" component={DetailsScreen} options={({ route }) => ({ title: route.params.name })}/>
          <Stack.Screen name="ChangeRegion" component={ChangeRegionScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;