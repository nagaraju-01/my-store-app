import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../../src/api/api';
import { tokenStorage } from '../../src/api/tokenStorage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '90%', // responsive width for all devices
    backgroundColor: '#f7f7f7',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#eee',
    color: '#222',
  },
  button: {
    width: '90%', // responsive width for all devices
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#ff6b6b',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  link: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginLeft: 4,
  },
});

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [alertMsg, setAlertMsg] = useState(params?.alertMsg as string || '');

  React.useEffect(() => {
    if (params?.alertMsg) {
      setAlertMsg(params.alertMsg as string);
      setTimeout(() => setAlertMsg(''), 3500);
    }
  }, [params?.alertMsg]);

  const handleSignIn = async () => {
    setMessage('');
    if (!email || !password) {
      setMessage('Please fill in all fields.');
      return;
    }
    try {
      const result = await api.signIn(email, password);
      await tokenStorage.setToken(result.token); // Store JWT token
      setMessage('');
      router.replace('/screens/customers-list');
    } catch (e) {
      const errorMessage = 'Invalid User credentials. Please try again.';
      setMessage(errorMessage);
    }
  };

  // Dismiss message on screen press
  const handleScreenPress = () => {
    if (message) setMessage('');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {alertMsg ? (
        <View style={{ position: 'absolute', zIndex: 100, top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="auto">
          <BlurView intensity={60} tint="light" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, marginHorizontal: 24, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 8 }}>
              <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 17, textAlign: 'center' }}>{alertMsg}</Text>
            </View>
          </BlurView>
        </View>
      ) : null}
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: '#fff', justifyContent: 'flex-start', paddingTop: 0 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable onPress={handleScreenPress} style={{ flex: 1, width: '100%' }}>
          {/* Custom Back Button */}
          <Pressable onPress={() => router.replace('/')} style={{ position: 'absolute', top: 8, left: -8, zIndex: 10, padding: 8 }}>
            <Text style={{ fontSize: 28, color: '#93329e', fontWeight: 'bold' }}>{'<'}</Text>
          </Pressable>
          {/* Illustration */}
          <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 16 }}>
            <Image source={require('../../assets/images/login.png')} style={{ width: 180, height: 120, resizeMode: 'contain' }} />
          </View>
          {/* Heading */}
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 32, marginLeft: 0, alignSelf: 'flex-start' }}>Login</Text>
          {/* Error Message */}
          {message ? (
            <View style={{ backgroundColor: '#ffeaea', borderRadius: 6, padding: 10, marginBottom: 16, alignSelf: 'stretch' }}>
              <Text style={{ color: '#d32f2f', fontSize: 15 }}>{message}</Text>
            </View>
          ) : null}
          {/* Email Input */}
          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#e0e0e0', marginBottom: 24, width: '100%', paddingHorizontal: 0 }}>
            <Ionicons name="mail-outline" size={20} color="#a3a3a3" style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, height: 48, fontSize: 16, color: '#222', backgroundColor: 'transparent' }}
              placeholder="Email ID"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#bbb"
            />
          </View>
          {/* Password Input */}
          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#e0e0e0', marginBottom: 32, width: '100%', paddingHorizontal: 0 }}>
            <Ionicons name="lock-closed-outline" size={20} color="#a3a3a3" style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, height: 48, fontSize: 16, color: '#222', backgroundColor: 'transparent' }}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#bbb"
            />
            <Pressable onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#a3a3a3" style={{ marginLeft: 8 }} />
            </Pressable>
          </View>
          {/* Login Button */}
          <Pressable style={{ width: '100%', backgroundColor: '#93329e', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 8 }} onPress={handleSignIn}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </>
  );
}
