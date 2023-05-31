import { Component } from 'react';
import { MenuContext, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

export default class App extends Component {
    render() {
      return (
        <MenuContext style={styles.container}>
          <View>
            <Menu>
              <MenuTrigger text="Open menu" />
  
              <MenuOptions>
                <MenuOption onSelect={() => alert(`Save`)} text="Save" />
                <MenuOption onSelect={() => alert(`Delete`)}>
                  <Text style={{ color: 'red' }}>Delete</Text>
                </MenuOption>
                <MenuOption
                  onSelect={() => alert(`Not called`)}
                  disabled={true}
                  text="Disabled"
                />
              </MenuOptions>
            </Menu>
          </View>
        </MenuContext>
      );
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 50,
      backgroundColor: '#ecf0f1',
    },
  });
  