import React from 'react';
import { LogBox, Appearance } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen, DetailsScreen, SetupScreen, Settings, AddContactScreen } from './components';
import { MenuProvider } from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppContext from './components/AppContext';

const Stack = createNativeStackNavigator();

const getCustomScheme = async () => {
  try {
    const value = await AsyncStorage.getItem('selectedMode');
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.log('Error retrieving selected mode:', error);
  }
  return Appearance.getColorScheme();
};

const storeCustomScheme = async (value) => {
  try {
    await AsyncStorage.setItem('selectedMode', value);
  } catch (error) {
    console.log('Error storing selected mode:', error);
  }
};

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore annoying warning
LogBox.ignoreLogs(['ReactImageView: Image source']);

function App() {
  const [scheme, setScheme] = React.useState("");
  
  getCustomScheme().then((value) => {
    setScheme(value);
  });

  const userSettings = {
    scheme: scheme,
    setScheme,
    storeCustomScheme,
  };

  return (
    <AppContext.Provider value={userSettings}>  
      <MenuProvider>
        <SafeAreaProvider>
          <StatusBar style={scheme === 'dark' ? "light" : "dark"} />
          <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack.Navigator screenOptions={{ animation: "slide_from_right" }}>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Details" component={DetailsScreen} options={({ route }) => ({ title: route.params.name })} />
              <Stack.Screen name="SetupScreen" component={SetupScreen} />
              <Stack.Screen name="Settings" component={Settings} />
              <Stack.Screen name="Add Contact" component={AddContactScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </MenuProvider>
    </AppContext.Provider>
  );
}

export default App;