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
          backgroundColor: 'orange',
        }}>
        <Text>Demo Module B</Text>
        <Button
          title="Say Hello to module A"
          onPress={() => engine.moduleRegistry.invoke('demo-module-a.some-method')}
        />
      </View>
    );
  }
}

export default class DemoModuleB {
  tabs() {
    return [
      {
        id: 'demoModuleB',
        label: 'B',
        screen: 'demo-module-b.demoModuleB',
        icon: require('./tab.png'),
        selectedIcon: require('./tabSelected.png'),
        testID: 'demoModuleB',
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
        id: 'demo-module-b.demoModuleB',
        generator: () => Screen,
      },
    ];
  }

  methods() {
    return [
      {
        id: 'demo-module-b.some-method',
        generator: () => () => {
          Alert.alert('Alert', 'Hello from module B');
        },
      },
    ];
  }

  prefix() {
    return 'demo-module-b';
  }
}
