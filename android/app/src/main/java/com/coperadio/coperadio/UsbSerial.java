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
  private static final int WRITE_WAIT_MILLIS = 200;
  private static final int READ_WAIT_MILLIS = 200;

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
  public void write(String str) {
    if (isDeviceConnected()) {
      try {
        byte[] data = (str + '\0').getBytes();
        port.write(data, WRITE_WAIT_MILLIS);
        Log.i("UsbSerial", "write " + str);
      } catch(IOException err) {
        Log.e("UsbSerial", "write error");
      }
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void setOption(int action, int val, boolean longBytes) {
    if (longBytes) {
      String value = String.format("%03d", val);
      write(action + value);
      return;
    }
    write("" + action + val);
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void setOption(int action, int value) {
    write("" + action + value);
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void sendMessage(String str, int addr, int flag) {
    String address = String.format("%03d", addr);
    write(1 + address + flag + str);
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void startSos(String str) {
    write("" + 31 + str);
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void stopSos() {
    setOption(3, 9);
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void setFrequency(int freq) {
    setOption(4, freq, true);
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void setAddress(int addr) {
    setOption(5, addr, true);
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public void setMode(int mode) {
    setOption(2, mode);
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
