import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { api } from '../../src/api/api';
import { tokenStorage } from '../../src/api/tokenStorage';

const AddCustomerScreen = () => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      router.replace('/screens/customers-list');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Customer</Text>
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
        <Button title="Add Customer" onPress={handleAddCustomer} disabled={!name || !contact} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
});

export default AddCustomerScreen;