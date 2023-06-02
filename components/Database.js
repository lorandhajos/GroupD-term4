import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

function openDatabase() {
  FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite').then((info) => {
    if (!(info.exists)) {
      FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
      console.info('SQLite directory created');
    }
  })

  return SQLite.openDatabase("coperadio.db");
}

const db = openDatabase();

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)',
      [],
      (_, error) => {
        if (error) {
          console.log('Error creating contacts table:', error);
        } else {
          console.log('Contacts table created successfully.');
        }
      }
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, contactId INTEGER NOT NULL, message TEXT NOT NULL)',
      [],
      (_, error) => {
        if (error) {
          console.log('Error creating messages table:', error);
        } else {
          console.log('Messages table created successfully.');
        }
      }
    );
  });
}

export const insertContact = (name) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO contacts (name) VALUES (?)',
      [name],
      (_, error) => {
        if (error) {
          console.log('Error inserting contact:', error);
        } else {
          console.log('Contact inserted successfully.');
        }
      }
    );
  });
}

export const insertMessage = (contactId, message) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO messages (contactId, message) VALUES (?, ?)',
      [contactId, message],
      (_, error) => {
        if (error) {
          console.log('Error inserting message:', error);
        } else {
          console.log('Message inserted successfully.');
        }
      }
    );
  });
}

export const getContacts = (setContactsFunc) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM contacts',
      [],
      (_, { rows }) => {
        setContactsFunc(rows._array);
      },
      (_, error) => {
        console.log('Error getting contacts:', error);
      }
    );
  });
}

export const getMessages = (contactId, setMessagesFunc) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM messages WHERE contactId = ?',
      [contactId],
      (_, { rows }) => {
        setMessagesFunc(rows._array);
      },
      (_, error) => {
        console.log('Error getting messages:', error);
      }
    );
  });
}

export default db;
