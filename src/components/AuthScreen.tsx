import React, { ReactNode } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Heading } from './Typography';
import { AppButton } from './AppButton';
import { AppLink } from './AppLink';
import { colors, fontSizes } from '../theme';

interface AuthScreenProps {
  title: string;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSubmit: () => void;
  buttonText: string;
  loading?: boolean;
  children?: ReactNode; // For extra fields like confirm password
  bottomText?: ReactNode; // For navigation links
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  title,
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  buttonText,
  loading,
  children,
  bottomText,
  style,
  inputStyle,
}) => (
  <KeyboardAvoidingView style={[styles.container, style]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Heading style={styles.title}>{title}</Heading>
    <TextInput
      style={[styles.input, inputStyle]}
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      autoCapitalize="none"
      keyboardType="email-address"
      placeholderTextColor="#bbb"
    />
    <TextInput
      style={[styles.input, inputStyle]}
      placeholder="Password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      placeholderTextColor="#bbb"
    />
    {children}
    <AppButton title={loading ? 'Loading...' : buttonText} onPress={onSubmit} disabled={loading} />
    {bottomText}
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: fontSizes.heading,
    color: colors.primary,
    marginBottom: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    width: 260,
    backgroundColor: colors.background,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: fontSizes.input,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.gray,
    color: colors.text,
  },
});
