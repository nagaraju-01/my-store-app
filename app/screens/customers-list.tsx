import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api } from '../../src/api/api';
import { tokenStorage } from '../../src/api/tokenStorage';
import { AppButton } from '../../src/components/AppButton';
import { Heading } from '../../src/components/Typography';
import { colors } from '../../src/theme';

const AddCustomerPopup = ({ visible, onClose, onSuccess }: any) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setName('');
      setContact('');
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleAddCustomer = async () => {
    if (!name || !contact) {
      Alert.alert('Validation Error', 'Please enter both name and contact.');
      return;
    }
    setLoading(true);
    try {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('No token found. Please sign in again.');
      await api.addCustomer({ name, contact }, token);
      setName('');
      setContact('');
      onSuccess && onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center', opacity: fadeAnim }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 18, minWidth: 220, alignItems: 'center', elevation: 6 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: colors.primary }}>Add Customer</Text>
          <TextInput
            style={styles.input}
            placeholder="Name*"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact*"
            value={contact}
            onChangeText={setContact}
            keyboardType="phone-pad"
          />
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <AppButton title="Add Customer" onPress={handleAddCustomer} disabled={!name || !contact} />
          )}
          <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
            <Text style={{ color: '#93329e', fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const AnimatedCustomerItem = ({ item, index, onPress }: any) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.listTile}>
          <View style={styles.tileLeft}>
            <View style={styles.tileAvatar}>
              <Text style={styles.tileAvatarText}>{item.name?.charAt(0)?.toUpperCase() || '?'}</Text>
            </View>
            <View>
              <Text style={styles.tileName}>{item.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="call-outline" size={15} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.tileContact}>{`+91 ${item.contact}`}</Text>
              </View>
            </View>
          </View>
          <View style={styles.tileRight}>
            <Ionicons name="chevron-forward" size={24} color="#bbb" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function CustomersList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [listKey, setListKey] = useState(0);
  const router = useRouter();

  // Handler for unauthorized (401) - redirect to sign-in
  const handleUnauthorized = async () => {
    await tokenStorage.removeToken();
    router.replace({ pathname: '/screens/sign-in', params: { alertMsg: 'Session expired. Please log in again.' } });
  };

  const handleSignOut = async () => {
    await tokenStorage.removeToken();
    router.replace('/');
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setListKey(prev => prev + 1); // force FlatList to re-mount and replay animation
      fetchCustomers(); // re-fetch customers on focus to handle session expiry
    }, [])
  );

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('No token found');
      const response = await api.getCustomers(token, handleUnauthorized);
      setCustomers(response);
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'message' in e && (e as any).message === 'Unauthorized') return;
      console.error('Error fetching customers:', e);
      if (Platform.OS === 'web') {
        window.alert('Error\nFailed to fetch customers');
      } else {
        Alert.alert('Error', 'Failed to fetch customers');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerPress = (item: any) => {
    router.push({ pathname: '/screens/debt-screen', params: { customerId: item.customerId, customerName: item.name } });
  };

  const renderAnimatedItem = ({ item, index }: any) => (
    <AnimatedCustomerItem item={item} index={index} onPress={() => handleCustomerPress(item)} />
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={[styles.background, { backgroundColor: '#f7f7f7' }]}> {/* Set dark white background */}
      {/* Sign Out Button at top right */}
      <TouchableOpacity onPress={handleSignOut} style={{ position: 'absolute', top: 18, right: 18, zIndex: 20, backgroundColor: '#fff', borderRadius: 20, padding: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 }}>
        <Ionicons name="log-out-outline" size={22} color="#0d8cae" />
      </TouchableOpacity>
      <View style={styles.overlay}>
        <Heading style={styles.title}>Customers</Heading>
        <FlatList
          key={listKey}
          data={customers}
          keyExtractor={item => item.customerId.toString()}
          style={{ width: '100%' }}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={renderAnimatedItem}
        />
        <AppButton title="ADD CUSTOMER" onPress={() => setShowAddPopup(true)} />
        <AddCustomerPopup
          visible={showAddPopup}
          onClose={() => setShowAddPopup(false)}
          onSuccess={fetchCustomers}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    alignItems: 'flex-start', // Move content to left
    width: '100%',
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d8cae', // Suitable blue for title
    marginLeft: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  listTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d8cae',
    borderRadius: 12,
    paddingVertical: 8, // Smaller height
    paddingHorizontal: 10, // Smaller width
    marginBottom: 8,
    shadowColor: '#0d8cae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 40,
    maxWidth: 260, // Even smaller card
  },
  tileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tileAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  tileName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  tileContact: {
    fontSize: 15,
    color: colors.subtitle,
  },
  tileRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minWidth: 220,
  },
});
