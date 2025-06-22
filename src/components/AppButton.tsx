import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({ title, onPress, style, textStyle, disabled }) => (
  <Pressable
    style={({ pressed }) => [
      styles.button,
      style,
      disabled && styles.disabled,
      pressed && styles.pressed,
    ]}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
  >
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  disabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});
