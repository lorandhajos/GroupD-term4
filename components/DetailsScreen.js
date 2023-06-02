import React from 'react';
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

function DetailsScreen({route}) {
  const { message } = route.params;
  return (
    <View style={styles.container}>
      <View style={styles.messagesContainer}>
        <Text key={1} style={styles.message}>
          {message}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Message" />
        <Pressable style={styles.sendButton}>
          <Ionicons name="send" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  message: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3385ff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default DetailsScreen;
