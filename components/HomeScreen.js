import React from 'react';
import { StyleSheet, Text, View, NativeModules, FlatList, Pressable, ToastAndroid, Alert} from 'react-native';
import { Entypo, Feather } from '@expo/vector-icons'; 
import { Menu, MenuOptions, MenuTrigger, MenuOption } from 'react-native-popup-menu';
import { CommonActions } from '@react-navigation/native';
import * as Databse from './Database';
import AppContext from './AppContext';

const { UsbSerial } = NativeModules;

function formatTime(time) {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

const Item = ({item, navigation, scheme}) => (
  <View style={styles.item}>
    <Pressable style={styles.contact} onPress={() => navigation.navigate('Details', {id: item.id, name: item.name})}>
      <Text style={[styles.name, {color: scheme === 'dark' ? 'white' : 'black'}]}>{item.name}</Text>
      <Text style={[styles.time, {color: scheme === 'dark' ? 'white' : 'black'}]}>{formatTime(item.time)}</Text>
      <Text style={[styles.message, {color: scheme === 'dark'  ?'white' : 'black'}]} numberOfLines={2}>{item.message}</Text>
    </Pressable>
  </View>
);

const HomeScreen = ({navigation}) => {
  const context = React.useContext(AppContext);
  const [scheme, setScheme] = React.useState(context.scheme);
  const [messages, setMessages] = React.useState();

  React.useEffect(() => {
    setScheme(context.scheme);
  }, [context.scheme]);

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
  }), [messages];

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu>
          <MenuTrigger>
            <Entypo name="dots-three-vertical" size={20} color={scheme === 'dark' ? 'white' : 'black'} />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption style={styles.menuOptions} onSelect={() => navigation.navigate('Settings')} text='Settings' />
          </MenuOptions>
        </Menu>
      ),
    });
  });

  return (
    <View style={[styles.container, {backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5'}]}>
      {messages && (
        <FlatList
          data={messages}
          renderItem={({item}) => <Item item={item} navigation={navigation} scheme={scheme}/>}
          keyExtractor={item => item.id}
        />
      )}
      <Menu style={styles.modalFloat}>
        <MenuTrigger>
          <View>
            <Feather name="alert-octagon" size={50} color={scheme === 'dark' ? 'white' : 'black'} />
          </View>
        </MenuTrigger>
        <MenuOptions>
          <Pressable style={styles.sosButton} onPress={(showAlert)}>
            <Text style={styles.sosText}>SOS</Text>
          </Pressable>
        </MenuOptions>
      </Menu>
    </View>
  );
}

const showAlert = () =>{
  Alert.alert(
    'SOS Message',
    'Are you sure you want to send message',
    [
      {
        text: 'Yes',
        onPress: () => UsbSerial.write('LOL I need help'),
      },

      {
        text: 'No',
        onPress: () => Alert.alert('SOS has been cancelled'),
      },
    ],
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  menuContainer: {
    opacity: 2,
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
    padding: 12,
    fontWeight: 'bold',
  },
  sosButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    width: '100%',
    backgroundColor: 'red',
  },
  sosText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
  },
  modalFloat: {
    alignItems: 'flex-end',
    marginRight: 10,
    marginVertical: '20%',
  },
});

export default HomeScreen;
