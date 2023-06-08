import React from 'react';
import { StyleSheet, Text, View, NativeModules, FlatList, Pressable, ToastAndroid } from 'react-native';
import { Entypo } from '@expo/vector-icons'; 
import { Menu, MenuOptions, MenuTrigger, MenuOption } from 'react-native-popup-menu';
import { CommonActions } from '@react-navigation/native';
import * as Databse from './Database';

function formatTime(time) {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

const Item = ({item, navigation}) => (
  <View style={styles.item}>
    <Pressable style={styles.contact} onPress={() => navigation.navigate('Details', {id: item.id, name: item.name})}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.time}>{formatTime(item.time)}</Text>
      <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
    </Pressable>
  </View>
);

const HomeScreen = ({navigation}) => {
  const [messages, setMessages] = React.useState();

  React.useEffect(() => {
    Databse.isInitialized().then((value) => {
      if (value) {
        Databse.getHomeScreenData(setMessages);
      } else {
        navigation.dispatch(() => {
          return CommonActions.reset({
            routes: [
              { name: 'SetupScreen' },
            ],
            index: 0,
          });
        });
      }
    });
  }, []);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Entypo name="dots-three-vertical" size={20} color="black" />
          </MenuTrigger>
          <MenuOptions style={styles.menuOptions}>
            <MenuOption onSelect={() => navigation.navigate('ChangeRegion')} text='Settings' />
          </MenuOptions>
        </Menu>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {messages && (
        <FlatList
          data={messages}
          renderItem={({item}) => <Item item={item} navigation={navigation} />}
          keyExtractor={item => item.id}
        />
      )}
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
    marginVertical: 4,
    marginHorizontal: 8,
    height: 85,
  },
  contact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: '100%',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    width: '75%',
  },
  time: {
    width: '25%',
    textAlign: 'right',
  },
  message: {
    width: '85%',
  },
  menuOptions: {
    padding: 8,
  },
});

export default HomeScreen;
