import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

export default function TabBarBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'white' }]} />
  );
}
