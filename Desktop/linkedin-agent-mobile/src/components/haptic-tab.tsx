import { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import { NavigationHelpers, ParamListBase, TabNavigationState } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { GestureResponderEvent } from 'react-native';

interface HapticTabProps {
  onPress: ((e: GestureResponderEvent) => void) | undefined;
  onLongPress: ((e: GestureResponderEvent) => void) | undefined;
  state: TabNavigationState<ParamListBase>;
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}

export function HapticTab({ onPress, onLongPress, state, navigation, ...rest }: HapticTabProps) {
  return (
    <PlatformPressable
      onPress={onPress}
      onLongPress={onLongPress}
      {...rest}
      android_ripple={{ borderless: true }}
    />
  );
}
