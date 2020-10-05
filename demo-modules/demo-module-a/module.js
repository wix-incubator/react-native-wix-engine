import {View, Text, Alert, Button} from 'react-native';
import React from 'react';

class Screen extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'cyan',
        }}>
        <Text>Demo Module A</Text>
        <Button
          title="Say Hello to module B"
          onPress={() => engine.moduleRegistry.invoke('demo-module-b.some-method')}
        />
      </View>
    );
  }
}

export default class DemoModuleA {
  tabs() {
    return [
      {
        id: 'demoModuleA',
        label: 'A',
        screen: 'demo-module-a.demoModuleA',
        icon: require('./home.png'),
        selectedIcon: require('./home_selected.png'),
      },
    ];
  }

  deepLinks() {
    return [
      {
        linkPattern: 'test/explicit/link/:parameter',
        externalPatterns: [
          'wix\\://explicit/external/link/:parameter',
          'wix\\://explicit/external/link/:metaSiteId/:parameter',
        ],
        screenId: 'demoModuleA',
      },
      {
        linkPattern: 'test/category/link',
        pushNotificationCategories: ['test/category'],
        screenId: 'demoModuleA',
      },
    ];
  }

  components() {
    return [
      {
        id: 'demo-module-a.demoModuleA',
        generator: () => Screen,
      },
    ];
  }

  methods() {
    return [
      {
        id: 'demo-module-a.some-method',
        generator: () => () => {
          Alert.alert('Alert', 'Hello from module A');
        },
      },
    ];
  }

  prefix() {
    return 'demo-module-a';
  }
}
