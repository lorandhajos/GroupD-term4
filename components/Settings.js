import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState("selectedLanguage"); // set default selected value
  const [selectedRegion, setSelectedRegion] = React.useState(""); // new state variable for selected region

  React.useEffect(() => {
    retrieveSelectedRegion();
  }, []);

  const handlePress = () => {
    setPickerVisible(!pickerVisible);
  };

  const handleRegionChange = (itemValue) => {
    setSelectedRegion(itemValue);
    storeSelectedRegion(itemValue);
  };

  const storeSelectedRegion = async (value) => {
    try {
      await AsyncStorage.setItem('selectedRegion', value);
    } catch (error) {
      console.log('Error storing selected region:', error);
    }
  };

  const retrieveSelectedRegion = async () => {
    try {
      const value = await AsyncStorage.getItem('selectedRegion');
      if (value !== null) {
        setSelectedRegion(value);
      }
    } catch (error) {
      console.log('Error retrieving selected region:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={[styles.row, {marginTop: 0}]}>
        <Image style={styles.image} source={require('../assets/theme.png')} />
        <Text style={styles.naming}>Appearance</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={handlePress}>
        <Image style={styles.image} source={require('../assets/region.png')} />
        <Text style={styles.naming}>Select Region</Text>
      </Pressable>
      {pickerVisible && (
        <Picker selectedValue={selectedRegion} // Use selectedRegion instead of selectedLanguage}
          onValueChange={handleRegionChange} // Use handleRegionChange function
        >
          <Picker.Item label="Europe" value="EU" />
          <Picker.Item label="Asia" value="AS" />
          <Picker.Item label="America" value="AM" />
        </Picker>
      )}
      <Pressable style={styles.row}>
        <Image style={styles.image} source={require('../assets/notification.png')} />
        <Text style={styles.naming}>Notifications</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFFFFF',
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
});

export default Settings;
