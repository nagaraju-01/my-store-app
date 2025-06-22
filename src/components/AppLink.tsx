import React from 'react';
import { Text, Pressable, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../theme';

interface AppLinkProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: TextStyle;
}

export const AppLink: React.FC<AppLinkProps> = ({ children, onPress, style }) => (
  <Pressable onPress={onPress} accessibilityRole="link">
    <Text style={[styles.link, style]}>{children}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  link: {
    color: colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
});
