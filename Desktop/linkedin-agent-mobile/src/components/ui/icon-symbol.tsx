import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet } from 'react-native';

export interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export function IconSymbol({
  name,
  size = 24,
  color = 'black',
  style,
}: IconSymbolProps) {
  return (
    <MaterialIcons
      name={name as any}
      size={size}
      color={color}
      style={[styles.icon, style]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
});
