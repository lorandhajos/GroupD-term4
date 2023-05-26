import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, NativeModules, TextInput, FlatList, Pressable, TouchableHighlight } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';


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

const Dropdown = () => {
  return (
    <View style={styles.countryContainer}>
      <Text style={styles.countryParagraph}>
        Select Region
      </Text>
      <DropDownPicker
          items={[
              {region: 'Asia', value: 'As'},
              {region: 'Europe', value: 'Eu'},
              {region: 'Amereica', value: 'Am'},
          ]}
          defaultIndex={0}
          containerStyle={{height: 40}}
          onChangeItem={item => console.log(item.label, item.value)}
      />
    </View>
  );
  };

  





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

function FirstTimeSetupScreen() {

}



function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{animation: "slide_from_right"}}>
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
  countryContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  countryParagraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
});

export default App;