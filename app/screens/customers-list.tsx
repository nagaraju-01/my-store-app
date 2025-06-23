import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={{ flex: 1, backgroundColor: 'rgba(30,30,30,0.28)', justifyContent: 'center', alignItems: 'center', opacity: fadeAnim, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 28, minWidth: 260, width: '98%', maxWidth: 480, alignItems: 'center', elevation: 8, justifyContent: 'center', paddingBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 18, color: colors.primary }}>Add Customer</Text>
            <TextInput
              style={[styles.input, { width: '100%', minWidth: 0, maxWidth: undefined }]}
              placeholder="Name*"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { width: '100%', minWidth: 0, maxWidth: undefined }]}
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
            <TouchableOpacity onPress={onClose} style={{ marginTop: 14 }}>
              <Text style={{ color: '#93329e', fontWeight: 'bold', fontSize: 18 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const DeleteCustomerModal = ({ visible, onDelete, onCancel, customerName }: any) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={{ flex: 1, backgroundColor: 'rgba(30,30,30,0.18)', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 18, paddingVertical: 36, paddingHorizontal: 24, minWidth: 220, width: '90%', maxWidth: 400, alignItems: 'center', shadowColor: '#93329e', shadowOpacity: 0.18, shadowRadius: 12, elevation: 12 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#d32f2f', marginBottom: 16 }}>Delete Customer?</Text>
        <Text style={{ color: '#333', marginBottom: 24 }}>Are you sure you want to delete {customerName}?</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <TouchableOpacity style={{ backgroundColor: '#d32f2f', borderRadius: 20, flex: 1, marginRight: 8, paddingVertical: 14, alignItems: 'center' }} onPress={onDelete}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#aaa', borderRadius: 20, flex: 1, paddingVertical: 14, alignItems: 'center' }} onPress={onCancel}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const AnimatedCustomerItem = ({ item, index, onPress, onLongPress }: any) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
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

  const handleLongPressCustomer = (item: any) => {
    setCustomerToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('No token found');
      await api.deleteCustomer(customerToDelete.customerId, token, handleUnauthorized);
      setDeleteModalVisible(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete customer');
      setDeleteModalVisible(false);
      setCustomerToDelete(null);
    }
  };

  const renderAnimatedItem = ({ item, index }: any) => (
    <AnimatedCustomerItem item={item} index={index} onPress={() => handleCustomerPress(item)} onLongPress={() => handleLongPressCustomer(item)} />
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={[styles.background, { backgroundColor: '#f7f7f7' }]}> {/* Set dark white background */}
      {/* Sign Out Button at top right */}
      <TouchableOpacity onPress={handleSignOut} style={{ position: 'absolute', top: 38, right: 18, zIndex: 20, backgroundColor: '#fff', borderRadius: 24, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 }}>
        <Ionicons name="log-out-outline" size={32} color="#0d8cae" />
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
        <View style={{ height: 0 }} /> {/* Reduce space above the button */}
        <AppButton title="ADD CUSTOMER" onPress={() => setShowAddPopup(true)} />
        <AddCustomerPopup
          visible={showAddPopup}
          onClose={() => setShowAddPopup(false)}
          onSuccess={fetchCustomers}
        />
        <DeleteCustomerModal
          visible={deleteModalVisible}
          onDelete={handleDeleteCustomer}
          onCancel={() => { setDeleteModalVisible(false); setCustomerToDelete(null); }}
          customerName={customerToDelete?.name}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    alignItems: 'flex-start',
    width: '100%',
    padding: 16,
    paddingTop: 40, // Add more top padding for heading and logout
  },
  title: {
    marginBottom: 16,
    fontSize: 30, // Increased font size
    fontWeight: 'bold',
    color: '#0d8cae',
    marginLeft: 4,
    marginTop: 16, // More top margin
    alignSelf: 'flex-start',
  },
  listTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d8cae',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#0d8cae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 56,
    width: '100%', // Make card fit full width
    maxWidth: undefined, // Remove maxWidth
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
    padding: 16, // increased for better touch area
    marginBottom: 16,
    fontSize: 20, // increased for better visibility
    backgroundColor: '#f9f9f9',
    width: '100%',
    minHeight: 56, // match Add Debt popup
  },
});
