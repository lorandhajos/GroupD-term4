import React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Databse from './Database';
import AppContext from './AppContext';

const AddContactScreen = ({navigation}) => {
  const context = React.useContext(AppContext);
  const [scheme, setScheme] = React.useState(context.scheme);
  const [hasPermission, setHasPermission] = React.useState(null);
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    setScheme(context.scheme);
  }, [context.scheme]);
  
  React.useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Databse.addContact("test", "test", "data");
    //Databse.addContact(data.name. data.address, data.publicKey)
    alert(data);
    navigation.dispatch(() => {
      return CommonActions.reset({
        routes: [
          { name: 'Home' },
        ],
        index: 0,
      });
    });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5' }]}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  absoluteFillObject: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 999,
  },
});

export default AddContactScreen;
