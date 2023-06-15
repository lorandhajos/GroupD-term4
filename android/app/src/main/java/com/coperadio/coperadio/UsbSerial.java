package com.coperadio.coperadio;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.hoho.android.usbserial.driver.UsbSerialDriver;
import com.hoho.android.usbserial.driver.UsbSerialProber;
import com.hoho.android.usbserial.driver.UsbSerialPort;
import java.util.Arrays;
import java.util.List;
import java.io.IOException;

import android.util.Log;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbManager;
import android.hardware.usb.UsbDeviceConnection;
import android.content.Context;
import android.app.Activity;

public class UsbSerial extends ReactContextBaseJavaModule {
  private static final String ACTION_USB_PERMISSION = BuildConfig.APPLICATION_ID + ".GRANT_USB";
  private static final int WRITE_WAIT_MILLIS = 2000;
  private static final int READ_WAIT_MILLIS = 2000;

  private UsbSerialPort port = null;

  UsbSerial(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "UsbSerial";
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean isDeviceConnected() {
    return port != null;
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean openDevice() {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      Log.e("UsbSerial", "No activity");
      return false;
    }

    // Find all available drivers from attached devices.
    UsbManager manager = (UsbManager) activity.getSystemService(Context.USB_SERVICE);
    List<UsbSerialDriver> availableDrivers = UsbSerialProber.getDefaultProber().findAllDrivers(manager);
    if (availableDrivers.isEmpty()) {
      Log.e("UsbSerial", "No available drivers");
      return false;
    }

    // Open a connection to the first available driver.
    UsbSerialDriver driver = availableDrivers.get(0);
    UsbDeviceConnection connection = manager.openDevice(driver.getDevice());
    if (connection == null) {
      Log.e("UsbSerial", "No connection");
      return false;
    }

    port = driver.getPorts().get(0);
    try {
      port.open(connection);
      port.setParameters(115200, UsbSerialPort.DATABITS_8, UsbSerialPort.STOPBITS_1, UsbSerialPort.PARITY_NONE);
      port.setDTR(true);
    } catch (IOException err) {
      Log.e("UsbSerial", "open error");
      disconnect();
      return false;
    }

    Log.i("UsbSerial", "open success");
    return true;
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void write(String str, int action, int addr, int flag) {
    String address = String.format("%03d", addr);
    if (isDeviceConnected()) {
      try {
        byte[] data = (str + action + address + flag + '\0').getBytes();
        port.write(data, WRITE_WAIT_MILLIS);
        Log.i("UsbSerial", "write " + str);
      } catch(IOException err) {
        Log.e("UsbSerial", "write error");
      }
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String read() {
    if (isDeviceConnected()) {
      try {
        byte[] buffer = new byte[512];
        int len = port.read(buffer, READ_WAIT_MILLIS);
        return new String(Arrays.copyOf(buffer, len));
      } catch(IOException err) {
        Log.e("UsbSerial", "connection lost: " + err.getMessage());
        disconnect();
      }
    }
    return null;
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void disconnect() {
    try {
      port.close();
    } catch(IOException err) {
      Log.e("UsbSerial", "close error");
    }
  }
}
