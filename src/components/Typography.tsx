import React, { ReactNode } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, fontSizes, fontWeights } from '../theme';

interface TypographyProps {
  children: ReactNode;
  style?: TextStyle;
}

export function Heading({ children, style }: TypographyProps) {
  return (
    <Text style={[styles.heading, style]}>{children}</Text>
  );
}

export function Subheading({ children, style }: TypographyProps) {
  return (
    <Text style={[styles.subheading, style]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: fontSizes.heading,
    fontWeight: '700', // Use numeric string for RN compatibility
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  subheading: {
    fontSize: fontSizes.subheading,
    fontWeight: '500',
    color: colors.subtitle,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.8,
  },
});
