import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const db = openDatabase();
var firstRun = false;

function openDatabase() {
  FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite').then((info) => {
    if (!(info.exists)) {
      FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
      console.info('SQLite directory created');
      firstRun = true;
    }
  })

  return SQLite.openDatabase("coperadio.db");
}

function createTables() {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address INTEGER, pubKey TEXT)'
    );

    tx.executeSql(
      'CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, contactId INTEGER NOT NULL, message TEXT NOT NULL, time INTEGER NOT NULL, type INTEGER NOT NULL, FOREIGN KEY(contactId) REFERENCES contacts(id))'
    );

    tx.executeSql(
      'CREATE TABLE contact (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address INTEGER NOT NULL, pubKey TEXT)'
    );
  }, (error) => {
    console.error('Error creating tables:', error);
  }, () => {
    console.log('Tables created successfully!');
  });
}

export const initDatabase = () => {
  if (firstRun) {
    createTables();
  }
}

export const isInitialized = async () => {
  try {
    const value = await AsyncStorage.getItem('isInitialized')
    if(value !== null) {
      return true;
    }
  } catch(e) {
    return false;
  }
  return false;
}

export const addContactInfo = (name, address, pubKey) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO contact (name, address, pubKey) VALUES (?, ?, ?)',
      [name, address, pubKey]
    );
  });
}

export const addContact = (name, address, pubKey) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO contacts (name, address, pubKey) VALUES (?, ?, ?)',
      [name, address, pubKey],
      (_, results) => {
        console.log('Contact added successfully!');
        insertMessage(results.insertId, 'You have added a new contact! Say hello!', Date.now(), 2);
      }
    );
  },
  (error) => {
    console.error('Error adding contact:', error);
  });
}

export const getAddress = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT address FROM contact',
        [],
        (_, { rows }) => {
          resolve(rows._array[0].address);
        },
        (_, error) => {
          console.error('Error getting contacts:', error);
          reject(error);
        }
      );
    });
  });
};

export const getContactIdByAddress = async (address) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id FROM contacts WHERE address = ?',
        [address],
        (_, { rows }) => {
          resolve(rows._array[0].id);
        },
        (_, error) => {
          console.error('Error getting id from contacts:', error);
          reject(error);
        }
      );
    });
  });
};

export const insertMessage = (contactId, message, time, type = 0) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO messages (contactId, message, time, type) VALUES (?, ?, ?, ?)',
      [contactId, message, time, type],
    );
  }, (error) => {
    console.error('Error inserting message:', error);
  });
}

export const getContact = (setContactFunc) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM contact',
      [],
      (_, { rows }) => {
        setContactFunc(rows._array);
      },
      (_, error) => {
        console.error('Error getting contacts:', error);
      }
    );
  });
}

export const getKeyFromContact = async (contactId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT pubKey FROM contacts WHERE id = ?',
        [contactId],
        (_, { rows }) => {
          resolve(rows._array[0].pubKey);
        },
        (_, error) => {
          console.error('Error getting key from contact:', error);
          reject(error);
        }
      );
    });
  });
}

export const getMessages = (contactId, setMessagesFunc) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT id, message, time, type FROM messages WHERE contactId = ?',
      [contactId],
      (_, { rows }) => {
        setMessagesFunc(rows._array);
      },
      (_, error) => {
        console.error('Error getting messages:', error);
      }
    );
  });
}

export const getHomeScreenData = (setHomeScreenData) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT contacts.id, name, message, time, address, pubKey FROM contacts JOIN messages ON messages.contactId = contacts.id WHERE messages.id = (SELECT MAX(id) FROM messages WHERE contactId = contacts.id)',
      [],
      (_, { rows }) => {
        setHomeScreenData(rows._array);
      },
      (_, error) => {
        console.error('Error getting contacts:', error);
      }
    );
  });
}

export const getMessageSize = (setMessageSizeFunc) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT COUNT(*) FROM messages',
      [],
      (_, { rows }) => {
        setMessageSizeFunc(rows._array[0]['COUNT(*)']);
      },
      (_, error) => {
        console.error('Error getting message size:', error);
      }
    );
  });
}

export default db;
