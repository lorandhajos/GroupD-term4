import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';


const Settings = ({navigation}) => {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Image source={require('../assets/theme.png')} />
                <Text style={styles.naming}> Appearance </Text>
            </View>

            <View style={styles.row}>
                <Image source={require('../assets/region.png')} />
                <Text style={styles.naming}> Select Region </Text>
            </View>

            <View style={styles.row}>
                <Image source={require('../assets/notification.png')} />
                <Text style={styles.naming}> Notifications </Text>
            </View>
        </View>
)};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center'
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    naming: {
        fontSize: 22,
    }
});

export default Settings;
