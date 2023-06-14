import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = () => {
  const [appearancePickerVisible, setAppearancePickerVisible] = React.useState(false);
  const [regionPickerVisible, setRegionPickerVisible] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState("selectedLanguage");
  const [selectedRegion, setSelectedRegion] = React.useState("");
  const [selectedMode, setSelectedMode] = React.useState("light");

  React.useEffect(() => {
    retrieveSelectedRegion();
    retrieveSelectedMode();
  }, []);

  const handleAppearancePress = () => {
    setAppearancePickerVisible(!appearancePickerVisible);
  };

  const handleRegionPress = () => {
    setRegionPickerVisible(!regionPickerVisible);
  };

  const handleModeChange = (itemValue) => {
    setSelectedMode(itemValue);
    storeSelectedMode(itemValue);
  };

  const handleRegionChange = (itemValue) => {
    setSelectedRegion(itemValue);
    storeSelectedRegion(itemValue);
  };

  const storeSelectedMode = async (value) => {
    try {
      await AsyncStorage.setItem('selectedMode', value);
    } catch (error) {
      console.log('Error storing selected mode:', error);
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

  const retrieveSelectedMode = async () => {
    try {
      const value = await AsyncStorage.getItem('selectedMode');
      if (value !== null) {
        setSelectedMode(value);
      }
    } catch (error) {
      console.log('Error retrieving selected mode:', error);
    }
  };

  const storeSelectedRegion = async (value) => {
    try {
      await AsyncStorage.setItem('selectedRegion', value);
    } catch (error) {
      console.log('Error storing selected region:', error);
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 8,
      backgroundColor: selectedMode === 'dark' ? '#313131' : '#F5F5F5',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      backgroundColor: selectedMode === 'dark' ? '#7A7A7A' : '#FFFFFF',
      padding: 10,
      borderRadius: 10,
    },
    naming: {
      fontSize: 20,
      marginLeft: 20,
      color: selectedMode === 'dark' ? '#000000' : '#000000',
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
    picker: {
      color: selectedMode === 'dark' ? '#FFFFFF' : '#000000',
    },
  });

  return (
    <View style={[styles.container]}>
      <Pressable style={[styles.row, { marginTop: 0 }]} onPress={handleAppearancePress}>
        <Image style={styles.image} source={require('../assets/theme.png')} />
        <Text style={[styles.naming]}>Appearance</Text>
      </Pressable>
      {appearancePickerVisible && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMode}
            onValueChange={handleModeChange}
            style={styles.picker}
          >
            <Picker.Item label="Light Mode" value="light" />
            <Picker.Item label="Dark Mode" value="dark" />
          </Picker>
        </View>
      )}
      <Pressable style={styles.row} onPress={handleRegionPress}>
        <Image style={styles.image} source={require('../assets/region.png')} />
        <Text style={[styles.naming]}>Select Region</Text>
      </Pressable>
      {regionPickerVisible && (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedRegion}
            onValueChange={handleRegionChange}
            style={styles.picker}
          >
            <Picker.Item label="Europe" value="EU" />
            <Picker.Item label="Asia" value="AS" />
            <Picker.Item label="America" value="AM" />
          </Picker>
        </View>
      )}
      <Pressable style={styles.row}>
        <Image style={styles.image} source={require('../assets/notification.png')} />
        <Text style={[styles.naming]}>Notifications</Text>
      </Pressable>
    </View>
  );
};

export default Settings;
