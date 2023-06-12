import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-elements';

const Settings = () => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EU"); // set default selected value 

  const handlePress = () => {
    setPickerVisible(!pickerVisible);
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
          selectedValue={selectedLanguage}
          style={{ height: 20, width: 150 }}
          onValueChange={(itemValue, itemIndex) => setSelectedLanguage(itemValue)}
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

  selectedLanguage: {
    alignSelf: 'auto',
  },
});

export default Settings;