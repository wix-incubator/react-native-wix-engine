import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';

export class NoModuleFoundScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Welcome To React Native Wix Engine</Text>
        <Text style={styles.descriptionText}>No Modules Found</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20
  },
  descriptionText: {
    color: '#1292B4',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10
  },
});
