import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen, DetailsScreen, SetupScreen, ChangeRegion } from './components';

const Stack = createNativeStackNavigator();

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
          <Stack.Screen name="ChangeRegion" component={ChangeRegion}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;