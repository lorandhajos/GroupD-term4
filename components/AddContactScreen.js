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
    if (type != 256)
      return;

    try {
      const contact = JSON.parse(data);
      Databse.addContact(contact.name, contact.address, contact.pubKey)
      console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    } catch (error) {
      console.error(error);
      return;
    }

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
    return <Text style={[styles.prompt, {color: scheme === 'dark' ? 'white' : 'black'}]}>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text style={[styles.prompt, {color: scheme === 'dark' ? 'white' : 'black'}]}>No access to camera</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5' }]}>
      <Text style={[styles.prompt, {color: scheme === 'dark' ? 'white' : 'black'}]}>Scan QR Code</Text>
      <Text style={[styles.explanation, {color: scheme === 'dark' ? 'white' : 'black'}]}>To add a new contact you need to scan their QR code.</Text>
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
    zIndex: 999,
  },
  prompt: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  explanation: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default AddContactScreen;
