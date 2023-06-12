import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("selectedLanguage"); // set default selected value
  const [selectedRegion, setSelectedRegion] = useState(""); // new state variable for selected region

  useEffect(() => {
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
      <View style={styles.row}>
        <Image source={require('../assets/theme.png')} />
        <Text style={styles.naming}> Appearance </Text>
      </View>

      <Pressable onPress={handlePress}>
        <View style={styles.row}>
          <Image source={require('../assets/region.png')} />
          <Text style={styles.naming}> Select Region </Text>
        </View>
      </Pressable>

      {pickerVisible && (
        <Picker
          selectedValue={selectedRegion} // Use selectedRegion instead of selectedLanguage
          style={{ height: 20, width: 150 }}
          onValueChange={handleRegionChange} // Use handleRegionChange function
        >
          <Picker.Item label="Europe" value="EU" />
          <Picker.Item label="Asia" value="AS" />
          <Picker.Item label="America" value="AM" />
        </Picker>
      )}

      <View style={styles.row}>
        <Image source={require('../assets/notification.png')} />
        <Text style={styles.naming}> Notifications </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  naming: {
    fontSize: 22,
  },
});

export default Settings;
