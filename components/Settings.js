import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, NativeModules } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppContext from './AppContext';

const { UsbSerial } = NativeModules;

const getSelectedRegion = async () => {
  try {
    const value = await AsyncStorage.getItem('selectedRegion');
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.log('Error retrieving selected region:', error);
  }
  return "EU";
};

const storeSelectedRegion = async (value) => {
  try {
    await AsyncStorage.setItem('selectedRegion', value);
    if (UsbSerial.isDeviceConnected()) {
      if (value === "EU") {
        UsbSerial.setFrequency(868);
      } else if (value === "AS") {
        UsbSerial.setFrequency(433);
      } else if (value === "AM") {
        UsbSerial.setFrequency(915);
      }
    }
  } catch (error) {
    console.log('Error storing selected region:', error);
  }
};

const Settings = () => {
  const context = React.useContext(AppContext);
  const [appearancePickerVisible, setAppearancePickerVisible] = React.useState(false);
  const [regionPickerVisible, setRegionPickerVisible] = React.useState(false);
  const [selectedRegion, setSelectedRegion] = React.useState('');
  const [scheme, setScheme] = React.useState(context.scheme);

  React.useEffect(() => {
    getSelectedRegion().then((value) => {
      setSelectedRegion(value);
    });
  }, []);

  React.useEffect(() => {
    context.storeCustomScheme(scheme);
    context.setScheme(scheme);
  }, [scheme]);

  React.useEffect(() => {
    storeSelectedRegion(selectedRegion);
  }, [selectedRegion]);

  return (
    <View style={[styles.container, {backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5'}]}>
      <Pressable style={[styles.row, {marginTop: 0, backgroundColor: scheme === 'dark' ? '#7a7a7a' : '#ffffff'}]} onPress={() => setAppearancePickerVisible(!appearancePickerVisible)}>
        <Image style={styles.image} source={require('../assets/theme.png')} />
        <Text style={[styles.naming, {color: scheme === 'dark' ? '#ffffff' : '#000000'}]}>Appearance</Text>
      </Pressable>
      {appearancePickerVisible && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={scheme}
            onValueChange={setScheme}
            style={{color: context.scheme === 'dark' ? '#ffffff' : '#000000'}}
          >
            <Picker.Item label="Light Mode" value="light" />
            <Picker.Item label="Dark Mode" value="dark" />
          </Picker>
        </View>
      )}
      <Pressable style={[styles.row, {backgroundColor: scheme === 'dark' ? '#7a7a7a' : '#ffffff'}]} onPress={() => setRegionPickerVisible(!regionPickerVisible)}>
        <Image style={styles.image} source={require('../assets/region.png')} />
        <Text style={[styles.naming, {color: scheme === 'dark' ? '#ffffff' : '#000000'}]}>Select Region</Text>
      </Pressable>
      {regionPickerVisible && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedRegion}
            onValueChange={setSelectedRegion}
            style={{color: context.scheme === 'dark' ? '#ffffff' : '#000000'}}
          >
            <Picker.Item label="Europe" value="EU" />
            <Picker.Item label="Asia" value="AS" />
            <Picker.Item label="America" value="AM" />
          </Picker>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
  },
  naming: {
    fontSize: 20,
    marginLeft: 20,
  },
  image: {
    width: 35,
    height: 35,
  },
  pickerContainer: {
    marginTop: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default Settings;
