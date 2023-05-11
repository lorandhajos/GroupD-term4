package com.coperadio.coperadio;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import com.hoho.android.usbserial.driver.UsbSerialDriver;
import com.hoho.android.usbserial.driver.UsbSerialProber;
import com.hoho.android.usbserial.driver.UsbSerialPort;
import java.util.List;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import android.util.Log;

import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbManager;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbDevice;
import android.content.Context;
import android.app.Activity;

public class UsbSerial extends ReactContextBaseJavaModule {
  private UsbSerialPort port = null;
  private static final int WRITE_WAIT_MILLIS = 2000;
  private static final int READ_WAIT_MILLIS = 2000;

  UsbSerial(ReactApplicationContext context) {
    super(context);
    this.port = null;
  }

  @Override
  public String getName() {
    return "UsbSerial";
  }

  @ReactMethod
  public void openDevice() {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      Log.e("UsbSerial", "No activity");
      return;
    }

    // Find all available drivers from attached devices.
    UsbManager manager = (UsbManager) activity.getSystemService(Context.USB_SERVICE);
    List<UsbSerialDriver> availableDrivers = UsbSerialProber.getDefaultProber().findAllDrivers(manager);
    if (availableDrivers.isEmpty()) {
      Log.e("UsbSerial", "No available drivers");
      return;
    }

    // Open a connection to the first available driver.
    UsbSerialDriver driver = availableDrivers.get(0);
    UsbDeviceConnection connection = manager.openDevice(driver.getDevice());
    if (connection == null) {
      //manager.requestPermission(driver.getDevice(), PendingIntent.getBroadcast(this, 0, new Intent(ACTION_USB_PERMISSION), 0));
      Log.e("UsbSerial", "No connection");
      return;
    }

    //UsbSerialPort port = driver.getPorts().get(0); // Most devices have just one port (port 0)
    port = driver.getPorts().get(0);
    try {
      port.open(connection);
      port.setParameters(115200, 8, UsbSerialPort.STOPBITS_1, UsbSerialPort.PARITY_NONE);
    } catch(IOException err) {
      Log.e("UsbSerial", "open error");
    }

    Log.i("UsbSerial", "open success");
  }

  @ReactMethod
  public void write(String data) {
    try {
      port.write(data.getBytes(), WRITE_WAIT_MILLIS);
    } catch(IOException err) {
      Log.e("UsbSerial", "write error");
    }
    
  }

  @ReactMethod
  public void colsePort() {
    try {
      port.close();
    } catch(IOException err) {
      Log.e("UsbSerial", "close error");
    }
  }
}
