import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  buttonsWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function StartScreen() {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground source={require('../assets/images/home.jpg')} style={{ flex: 1, width: '100%', height: '100%' }} resizeMode="cover" imageStyle={{ width: '100%', height: '100%' }}>
        <View style={[styles.container, { backgroundColor: 'rgba(255,255,255,0.85)', paddingTop: 0 }]}> 
          {/* Heading */}
          <Text style={{ fontSize: 34, fontWeight: 'bold', color: '#93329e', marginTop: 80, marginBottom: 24, textAlign: 'center' }}>Welcome to Sreejita Kirana</Text>
          <Text style={{ fontSize: 20, color: '#555', marginBottom: 48, textAlign: 'center', paddingHorizontal: 8 }}>
            Your one-stop shop for all your daily needs. Please log in or sign up to continue.
          </Text>
          <View style={[styles.buttonsWrapper, { marginTop: 24, flex: 0, justifyContent: 'center', alignItems: 'center' }]}> {/* Move buttons slightly down */}
            {/* Log In Button */}
            <Pressable style={{ width: 220, backgroundColor: '#93329e', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 16 }} onPress={() => router.push('/screens/sign-in')}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Log In</Text>
            </Pressable>
            {/* Sign Up Button */}
            <Pressable style={{ width: 220, backgroundColor: '#fff', borderWidth: 2, borderColor: '#93329e', borderRadius: 8, paddingVertical: 16, alignItems: 'center' }} onPress={() => router.push('/screens/sign-up')}>
              <Text style={{ color: '#93329e', fontWeight: 'bold', fontSize: 18 }}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
        {/* Color wave footer */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 100, zIndex: 1 }} pointerEvents="none">
          <Svg height="100" width="100%" viewBox="0 0 400 100" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
            <Path
              d="M0,60 Q100,120 200,60 T400,60 V100 H0 Z"
              fill="#93329e"
              opacity={0.28}
            />
          </Svg>
        </View>
        {/* Copyright footer */}
        <View style={{ width: '100%', alignItems: 'flex-end', position: 'absolute', bottom: 18, right: 0, zIndex: 2 }}>
          <Text style={{ color: '#93329e', fontSize: 15, fontWeight: 'bold', marginRight: 18, textShadowColor: '#fff', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
            © Nagaraju Ande
          </Text>
        </View>
      </ImageBackground>
    </>
  );
}
