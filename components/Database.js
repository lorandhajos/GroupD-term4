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
      'CREATE TABLE contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, pubKey TEXT)'
    );

    tx.executeSql(
      'CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, contactId INTEGER NOT NULL, message TEXT NOT NULL, time INTEGER NOT NULL, FOREIGN KEY(contactId) REFERENCES contacts(id))',
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
    // TODO: Remove this before release
    fillDatabase();
  }
}

export const fillDatabase = () => {
  insertContact('John Doe');
  insertContact('Jane Smith');
  insertContact('Bob Johnson');
  insertContact('Alice Williams');

  insertMessage(1, 'Hello!', Date.now());
  insertMessage(2, 'This is a really long test message testing testing\ntesting test test test', Date.now());
  insertMessage(3, 'Testing', Date.now());
  insertMessage(4, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', Date.now());
  insertMessage(4, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', Date.now());
  insertMessage(4, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', Date.now());
  insertMessage(4, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', Date.now());
  insertMessage(4, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', Date.now());
}

export const insertContact = (name) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO contacts (name) VALUES (?)',
      [name]
    );
  });
}

export const insertMessage = (contactId, message, time) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO messages (contactId, message, time) VALUES (?, ?, ?)',
      [contactId, message, time],
    );
  }, (error) => {
    console.error('Error inserting message:', error);
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
        console.error('Error getting contacts:', error);
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
        console.error('Error getting messages:', error);
      }
    );
  });
}

export const getLastMessage = (contactId, setLastMessageFunc) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM messages WHERE contactId = ? ORDER BY id DESC LIMIT 1',
      [contactId],
      (_, { rows }) => {
        setLastMessageFunc(rows._array[0]);
      },
      (_, error) => {
        console.error('Error getting last message:', error);
      }
    );
  });
}

export const getHomeScreenData = (setHomeScreenData) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT contacts.id, name, message, time FROM contacts JOIN messages ON messages.contactId = contacts.id WHERE messages.id = (SELECT MAX(id) FROM messages WHERE contactId = contacts.id)',
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

export default db;
