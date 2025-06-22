import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

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
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    width: 220,
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
  outlineButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  outlineButtonText: {
    color: '#ff6b6b',
  },
});

export default function StartScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground source={require('../assets/images/home.jpg')} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover" imageStyle={{ width: '100%', height: '100%' }}>
        <View style={[styles.container, { backgroundColor: 'rgba(255,255,255,0.85)', paddingTop: 0, justifyContent: 'flex-start' }]}> 
          {/* Heading */}
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#93329e', marginTop: 64, marginBottom: 16, textAlign: 'center' }}>Welcome to Sreejita Kirana</Text>
          <Text style={{ fontSize: 16, color: '#555', marginBottom: 32, textAlign: 'center', paddingHorizontal: 8 }}>
            Your one-stop shop for all your daily needs. Please log in or sign up to continue.
          </Text>
          {/* Log In Button */}
          <Pressable style={{ width: 220, backgroundColor: '#93329e', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 16 }} onPress={() => router.push('/screens/sign-in')}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Log In</Text>
          </Pressable>
          {/* Sign Up Button */}
          <Pressable style={{ width: 220, backgroundColor: '#fff', borderWidth: 2, borderColor: '#93329e', borderRadius: 8, paddingVertical: 16, alignItems: 'center' }} onPress={() => router.push('/screens/sign-up')}>
            <Text style={{ color: '#93329e', fontWeight: 'bold', fontSize: 18 }}>Sign Up</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </>
  );
}
