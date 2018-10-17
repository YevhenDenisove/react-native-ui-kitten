import React from 'react';
import { View } from 'react-native';
import {
  RkTabView,
  RkTab,
  RkStyleSheet,
} from 'react-native-ui-kitten';
import { TabContentScreen } from './TabContentScreen';

export class BaseTabViewScreen extends React.Component {
  static navigationOptions = {
    title: 'Base Tabs',
  };

  render() {
    return (
      <View style={styles.container}>
        <RkTabView style={styles.container}>
          <RkTab title='Calls'>
            <TabContentScreen style={styles.tabContent1} />
          </RkTab>
          <RkTab title='Contacts'>
            <TabContentScreen style={styles.tabContent2} />
          </RkTab>
        </RkTabView>
      </View>
    );
  }
}

const styles = RkStyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContent1: {
    backgroundColor: 'red',
  },
  tabContent2: {
    backgroundColor: 'green',
  },
}));
