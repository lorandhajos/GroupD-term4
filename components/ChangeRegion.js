import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { useState} from 'react';
import { Text, View } from 'react-native';

function ChangeRegion({navigation}){
  const [selectedLanguage, setSelectedLanguage] = useState();
  return (
    <View>
      <Text>
        {'Select Region'}
      </Text>
      <Picker
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

export default ChangeRegion;