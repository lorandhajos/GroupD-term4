import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { useState} from 'react';
import { Text, View, StyleSheet } from 'react-native';


function ChangeRegion({navigation}){
  const [selectedLanguage, setSelectedLanguage] = useState();
  return (
    <View  >
      <Text style={styles.text}>
        {'Select Region'}
      </Text>
      <Picker style={styles.selectedLanguage}
     selectedValue={selectedLanguage}
  onValueChange={(itemValue, itemIndex) =>
    setSelectedLanguage(itemValue)
  }>
  <Picker.Item label="Europe" value="EU" />
  <Picker.Item label="Asia" value="AS" />
  <Picker.Item label="America" value="AM" />
  </Picker>
    </View>
  );

}
const styles = StyleSheet.create({
  text: {
    paddingLeft:'40%',
    width: '100%',
    paddingBottom:'10%',
    paddingTop:'2%',
  },
  selectedLanguage:{
    alignSelf:'auto',
    
  },

});
export default ChangeRegion;