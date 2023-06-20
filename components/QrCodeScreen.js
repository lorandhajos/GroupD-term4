import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AppContext from './AppContext';
import * as Database from './Database';

const QrCodeScreen = ({navigation}) => {
  const context = React.useContext(AppContext);
  const [scheme, setScheme] = React.useState(context.scheme);
  const [qrCodeValue, setQrCodeValue] = React.useState([]);

  React.useEffect(() => {
    setScheme(context.scheme);
  }, [context.scheme]);

  React.useEffect(() => {
    Database.isInitialized().then((value) => {
      if (value) {
        Database.getContact(setQrCodeValue);
      }
    });
  }), [qrCodeValue];

  if (qrCodeValue.length < 1) {
    return (
      <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5'}]}>
        <Text style={[styles.prompt,  {color: scheme === 'dark' ? 'white' : 'black'}]}>Loading...</Text>
      </View>
    );
  }

  const text = JSON.stringify(qrCodeValue[0]);

  return (
    <View style={[styles.container, { backgroundColor: scheme === 'dark' ? '#313131' : '#f5f5f5'}]}>
      <Text style={[styles.prompt,  {color: scheme === 'dark' ? 'white' : 'black'}]}>This your contact information</Text>
      <Text style={[styles.explanation, {color: scheme === 'dark' ? 'white' : 'black'}]}>If you want someone to add you to their contacts you need them to scan this code</Text>
      <View style={styles.qrContainer}>
        <QRCode value={text} size={200} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
});

export default QrCodeScreen;
