import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, NativeModules } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const {UsbSerial} = NativeModules;

const manager = new BleManager();

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Button title={"Scan"} onPress={() => {
        manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.warn(error);
            return
          }
        
          if (device.name != "null") {
              this.manager.stopDeviceScan();
              console.log(device.name);
          }
        });
      }} />
      <Button title={"Usb"} onPress={() => {
        UsbSerial.openDevice()
      }} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
