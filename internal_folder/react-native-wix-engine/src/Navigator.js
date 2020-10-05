import {Navigation} from 'react-native-navigation';
import autobind from 'react-autobind';

const BOTTOM_TABS_ELEMENT_ID = 'BottomTabs';

export class Navigator {
  constructor({moduleRegistry}) {
    this.moduleRegistry = moduleRegistry;
    autobind(this);
  }

  async startTabbedApp(tabs) {
    const convertedTabs = await this.convertTabs(tabs);
    await Navigation.setRoot({
      root: {
        bottomTabs: {
          id: BOTTOM_TABS_ELEMENT_ID,
          children: convertedTabs,
        },
      },
    });
  }

  async convertTabs(tabs) {
    const convertedTabs = tabs.map(async tab => {
      return {
        stack: {
          tab: tab.id,
          children: [
            {
              component: {
                name: tab.screen,
              },
            },
          ],
          options: {
            bottomTab: {
              icon: tab.icon,
              selectedIcon: tab.selectedIcon,
              iconColor: tab.iconColor,
              selectedIconColor: tab.selectedIconColor,
              text: tab.label,
            },
          },
        },
      };
    });
    return await Promise.all(convertedTabs);
  }
}
