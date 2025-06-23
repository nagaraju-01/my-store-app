import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Easing, Image, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { api } from '../../src/api/api';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalColor, setModalColor] = useState('#d32f2f');
  const [modalType, setModalType] = useState<'success' | 'error'>('error');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showPopup = (msg: string, color: string = '#d32f2f', duration = 2000, onSuccess?: () => void, type: 'success' | 'error' = 'error') => {
    setModalMessage(msg);
    setModalColor(color);
    setModalType(type);
    setModalVisible(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.85);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true })
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.85, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true })
      ]).start(() => {
        setModalVisible(false);
        if (onSuccess) onSuccess();
      });
    }, duration);
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      showPopup('Please fill in all fields.', '#d32f2f', 2000, undefined, 'error');
      return;
    }
    if (password !== confirmPassword) {
      showPopup('Passwords do not match.', '#d32f2f', 2000, undefined, 'error');
      return;
    }
    try {
      const res = await api.signUp(email, password, confirmPassword);
      if (res.state === 'failed') {
        showPopup(res.error || 'Sign up failed. Please try again.', '#d32f2f', 2000, undefined, 'error');
      } else if (res.state === 'success') {
        showPopup('User registered', '#388e3c', 1500, () => router.replace('/screens/sign-in'), 'success');
      } else {
        showPopup('Unexpected response.', '#d32f2f', 2000, undefined, 'error');
      }
    } catch (e) {
      const errorMessage = (e as any)?.message || 'Sign up failed. Please try again.';
      showPopup(errorMessage, '#d32f2f', 2000, undefined, 'error');
    }
  };

  // Dismiss message on screen press
  const handleScreenPress = () => {
    if (modalMessage) setModalMessage('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <Animated.View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(30,30,30,0.25)',
          opacity: fadeAnim,
        }}>
          <Animated.View style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            paddingVertical: 24, // reduced for better scaling
            paddingHorizontal: 20, // reduced for better scaling
            minWidth: '70%', // responsive minWidth
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 12,
            transform: [{ scale: scaleAnim }],
          }}>
            <Ionicons
              name={modalType === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={48}
              color={modalType === 'success' ? '#388e3c' : '#d32f2f'}
              style={{ marginBottom: 12 }}
            />
            <Text style={{ color: modalColor, fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 2 }}>{modalMessage}</Text>
          </Animated.View>
        </Animated.View>
      </Modal>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable onPress={handleScreenPress} style={{ flex: 1, width: '100%' }}>
          {/* Custom Back Button */}
          <Pressable onPress={() => router.replace('/')} style={{ position: 'absolute', top: 32, left: 0, zIndex: 10, padding: 16, borderRadius: 24 }}>
            <Text style={{ fontSize: 36, color: '#93329e', fontWeight: 'bold' }}>{'<'}</Text>
          </Pressable>
          {/* Illustration */}
          <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 12 }}>
            <Image source={require('../../assets/images/register.png')} style={{ width: 260, height: 180, resizeMode: 'contain' }} />
          </View>
          {/* Centered Sign Up Form */}
          <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', width: '100%', marginTop: 40 }}>
            {/* Heading */}
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 8, alignSelf: 'flex-start' }}>Sign Up</Text>
            {/* Email Input */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%' }}>
              <Ionicons name="mail-outline" size={20} color="#a3a3a3" style={{ marginRight: 8, position: 'absolute', left: 16, zIndex: 2 }} />
              <LinearGradient
                colors={["#f8e8ff", "#f3f3fa"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  paddingHorizontal: 0,
                  justifyContent: 'center',
                  minHeight: 48,
                  elevation: 1,
                }}
              >
                <TextInput
                  style={{
                    height: 48,
                    fontSize: 16,
                    color: '#222',
                    backgroundColor: 'transparent',
                    borderRadius: 16,
                    paddingLeft: 40,
                    paddingRight: 16,
                  }}
                  placeholder="Email ID"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#bbb"
                />
              </LinearGradient>
            </View>
            {/* Password Input */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%' }}>
              <Ionicons name="lock-closed-outline" size={20} color="#a3a3a3" style={{ marginRight: 8, position: 'absolute', left: 16, zIndex: 2 }} />
              <LinearGradient
                colors={["#f8e8ff", "#f3f3fa"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  paddingHorizontal: 0,
                  justifyContent: 'center',
                  minHeight: 48,
                  elevation: 1,
                }}
              >
                <TextInput
                  style={{
                    height: 48,
                    fontSize: 16,
                    color: '#222',
                    backgroundColor: 'transparent',
                    borderRadius: 16,
                    paddingLeft: 40,
                    paddingRight: 40,
                  }}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#bbb"
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)} style={{ position: 'absolute', right: 8, top: 13 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#a3a3a3" />
                </Pressable>
              </LinearGradient>
            </View>
            {/* Confirm Password Input */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, width: '100%' }}>
              <Ionicons name="lock-closed-outline" size={20} color="#a3a3a3" style={{ marginRight: 8, position: 'absolute', left: 16, zIndex: 2 }} />
              <LinearGradient
                colors={["#f8e8ff", "#f3f3fa"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  paddingHorizontal: 0,
                  justifyContent: 'center',
                  minHeight: 48,
                  elevation: 1,
                }}
              >
                <TextInput
                  style={{
                    height: 48,
                    fontSize: 16,
                    color: '#222',
                    backgroundColor: 'transparent',
                    borderRadius: 16,
                    paddingLeft: 40,
                    paddingRight: 40,
                  }}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#bbb"
                />
                <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)} style={{ position: 'absolute', right: 8, top: 13 }}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#a3a3a3" />
                </Pressable>
              </LinearGradient>
            </View>
            {/* Sign Up Button */}
            <Pressable style={{ width: '100%', backgroundColor: '#93329e', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 8 }} onPress={handleSignUp}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Sign Up</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
              <Text>Already have an account?</Text>
              <Text style={{ color: '#93329e', fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 16, marginLeft: 4 }} onPress={() => router.replace('/screens/sign-in')}>Sign In</Text>
            </View>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
