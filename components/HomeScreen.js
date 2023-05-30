import React from 'react';
import { StyleSheet, Text, View, NativeModules, FlatList, Pressable, ToastAndroid } from 'react-native';

const {UsbSerial} = NativeModules;

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

const HomeScreen = ({navigation}) => {
  if (UsbSerial.isDeviceConnected()) {
    ToastAndroid.show('Radio Module connected!', ToastAndroid.SHORT);
  } else {
    ToastAndroid.show('Radio Module not connected!', ToastAndroid.SHORT);
  }

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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

export default HomeScreen;
