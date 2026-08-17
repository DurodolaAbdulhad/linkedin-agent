import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/tab-bar-background';

import Dashboard from './dashboard';
import Profiles from './profiles';
import Drafts from './drafts';
import Settings from './settings';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarActiveTintColor: '#0D9488',
          tabBarInactiveTintColor: '#999',
          tabBarLabelStyle: { fontSize: 12, marginTop: -8 },
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}
      >
        <Tab.Screen
          name="dashboard"
          component={Dashboard}
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tab.Screen
          name="profiles"
          component={Profiles}
          options={{
            title: 'Profiles',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
          }}
        />
        <Tab.Screen
          name="drafts"
          component={Drafts}
          options={{
            title: 'Drafts',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.fill" color={color} />,
          }}
        />
        <Tab.Screen
          name="settings"
          component={Settings}
          options={{
            title: 'More',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
