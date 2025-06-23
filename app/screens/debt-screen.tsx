import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api } from '../../src/api/api';
import { tokenStorage } from '../../src/api/tokenStorage';
import { generateCustomerDebtsPdf } from '../../utils/generateCustomerDebtsPdf';

export default function DebtScreen() {
  const { customerId, customerName } = useLocalSearchParams();
  const [debts, setDebts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  // Always use size=10 for pagination
  const [size] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null);
  const [totalDebt, setTotalDebt] = useState(0);
  const router = useRouter();

  // Handler for unauthorized (401) - redirect to sign-in
  const handleUnauthorized = async (action?: string) => {
    await tokenStorage.removeToken();
    let msg = 'Session expired. Please log in and try again.';
    if (action === 'add') msg = 'Session expired. Debt was not added. Please log in and try again.';
    if (action === 'delete') msg = 'Session expired. Debt was not deleted. Please log in and try again.';
    router.replace({ pathname: '/screens/sign-in', params: { alertMsg: msg } });
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation for delete modal
  const deleteAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    fetchDebts();
  }, []);

  useEffect(() => {
    if (deleteModalVisible) {
      deleteAnim.setValue(0);
      Animated.timing(deleteAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }
  }, [deleteModalVisible]);

  const fetchDebts = async (nextPage = 0) => {
    setLoading(true);
    try {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('No token found');
      // Fetch paginated debts for the current page using getDebtsByCustomerIdAndPagination
      const response = await api.getDebtsByCustomerIdAndPagination(customerId as string, token, () => handleUnauthorized(), nextPage, size);
      setDebts(response.content || response);
      setHasMore(response.content ? !response.last : (response.length === size));
      setPage(nextPage);
      // Fetch all debts (no pagination) to calculate total using getDebtsByCustomerId
      const allDebtsResponse = await api.getDebtsByCustomerId(customerId as string, token, () => handleUnauthorized());
      const allDebts = allDebtsResponse.content || allDebtsResponse;
      setTotalDebt(allDebts.reduce((sum: number, d: any) => sum + (d.amount || 0), 0));
    } catch (e) {
      if ((e as any)?.message === 'Unauthorized') return;
      Alert.alert('Error', 'Failed to fetch debts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async () => {
    let hasError = false;
    if (!amount || isNaN(Number(amount))) {
      setAmountError(true);
      hasError = true;
    } else {
      setAmountError(false);
    }
    if (!description) {
      setDescriptionError(true);
      hasError = true;
    } else {
      setDescriptionError(false);
    }
    if (hasError) {
      Vibration.vibrate(100);
      return;
    }
    setAdding(true);
    try {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('No token found');
      await api.addDebt(
        { customerId: customerId as string, amount: Number(amount), description },
        token,
        () => handleUnauthorized('add')
      );
      setAmount('');
      setDescription('');
      setShowAddDebtModal(false);
      fetchDebts();
    } catch (e) {
      if ((e as any)?.message === 'Unauthorized') {
        setShowAddDebtModal(false);
        // handleUnauthorized already called by API
        return;
      }
      Alert.alert('Error', 'Failed to add debt');
    } finally {
      setAdding(false);
    }
  };

  const handleDescriptionChange = (text: string) => {
    if (/\d/.test(text)) {
      setDescriptionError(true);
      Vibration.vibrate(100);
      return;
    }
    setDescription(text);
    setDescriptionError(false);
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and dot
    if (/[^\d.]/.test(text)) {
      setAmountError(true);
      Vibration.vibrate(100);
      return;
    }
    setAmount(text);
    setAmountError(false);
  };

  const handleLogout = async () => {
    await tokenStorage.removeToken();
    router.replace('/');
  };

  // Show custom delete confirmation modal
  const handleDeleteDebt = (debtId: string) => {
    setDebtToDelete(debtId);
    setDeleteModalVisible(true);
  };

  // Confirm delete logic (async)
  const confirmDeleteDebt = async () => {
    if (!debtToDelete) return;
    try {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('No token found');
      await api.deleteDebt(debtToDelete, token, () => handleUnauthorized('delete'));
      setDeleteModalVisible(false);
      setDebtToDelete(null);
      fetchDebts();
    } catch (e) {
      if ((e as any)?.message === 'Unauthorized') return;
      Alert.alert('Error', 'Failed to delete debt');
      setDeleteModalVisible(false);
      setDebtToDelete(null);
    }
  };

  // PDF generation handler using the utility function
  const handleGeneratePdf = async () => {
    try {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('No token found');
      // Fetch all debts (no pagination) using getDebtsByCustomerId
      const allDebtsResponse = await api.getDebtsByCustomerId(customerId as string, token, () => handleUnauthorized());
      const allDebts = allDebtsResponse.content || allDebtsResponse;
      // Use the utility function to generate the PDF
      await generateCustomerDebtsPdf(allDebts, customerName as string);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
          <Text style={styles.backButton} onPress={() => router.back()}>{'<'}</Text>
          <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#fff', borderRadius: 24, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 }}>
            <Ionicons name="log-out-outline" size={32} color="#d32f2f" />
          </TouchableOpacity>
        </View>
        <View style={{ height: 32 }} />
        <Text style={styles.headerText}>Debts for {customerName}</Text>
        {/* Total and PDF button row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={styles.totalDebtText}>Total: ₹{totalDebt.toFixed(2)}</Text>
          <Pressable onPress={handleGeneratePdf} style={{ marginLeft: 12 }}>
            <Text style={{ color: '#0d8cae', fontWeight: 'bold', fontSize: 15, textDecorationLine: 'underline' }}>PDF</Text>
          </Pressable>
        </View>
        {/* Pagination Controls */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4, marginBottom: 4 }}>
          <Pressable
            onPress={() => { if (page > 0) { fetchDebts(page - 1); } }}
            style={{ padding: 10, opacity: page === 0 ? 0.4 : 1 }}
            disabled={page === 0}
          >
            <Text style={{ fontSize: 22, color: page === 0 ? '#aaa' : '#0d8cae', fontWeight: 'bold' }}>{'<'}</Text>
          </Pressable>
          <Text style={{ marginHorizontal: 16, fontSize: 16, color: '#0d8cae', fontWeight: 'bold' }}>Page {page + 1}</Text>
          <Pressable
            onPress={() => { if (hasMore) { fetchDebts(page + 1); } }}
            style={{ padding: 10, opacity: !hasMore ? 0.4 : 1 }}
            disabled={!hasMore}
          >
            <Text style={{ fontSize: 22, color: !hasMore ? '#aaa' : '#0d8cae', fontWeight: 'bold' }}>{'>'}</Text>
          </Pressable>
        </View>
        {/* Move Add Debt button just below the pagination controls and above the debts list */}
        <Pressable style={[styles.addDebtMainButton, { marginTop: 0, marginBottom: 10 }]} onPress={() => setShowAddDebtModal(true)}>
          <Text style={styles.addDebtMainButtonText}>+ Add Debt</Text>
        </Pressable>
        {/* Debts List - move up by reducing margin/padding above */}
        {loading ? (
          <ActivityIndicator size="large" color="#0d8cae" />
        ) : (
          <FlatList
            contentContainerStyle={{ paddingTop: 0, paddingBottom: 16 }}
            data={debts}
            keyExtractor={item => item.debtId?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <View style={styles.debtRow}>
                <Text style={styles.debtSerial}>{item.serialNumber}</Text>
                <Text style={styles.debtAmount}>₹{item.amount}</Text>
                <Text style={styles.debtDesc}>{item.description}</Text>
                <Text style={styles.debtDate}>{item.date}</Text>
                <Pressable
                  onPress={() => handleDeleteDebt(item.debtId?.toString?.() || '')}
                  style={styles.deleteDebtButton}
                  android_ripple={{ color: '#ff1744', borderless: true }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Delete debt"
                >
                  <Ionicons name="trash-outline" size={22} color="#ff1744" />
                </Pressable>
              </View>
            )}
            // Remove infinite scroll
          />
        )}
        <Modal
          visible={showAddDebtModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddDebtModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.addDebtModalCard, { minHeight: 340, borderRadius: 20, padding: 28, width: '98%', maxWidth: 480, alignItems: 'center', justifyContent: 'center', paddingBottom: 24 }]}>
              <Text style={styles.addDebtModalTitle}>Add Debt</Text>
              <TextInput
                style={[
                  styles.inputGradient,
                  { width: '100%', minWidth: 0, maxWidth: undefined, fontSize: 20, minHeight: 56 },
                  amountError && styles.inputError
                ]}
                placeholder="Amount"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
              />
              <TextInput
                style={[
                  styles.inputGradient,
                  { width: '100%', minWidth: 0, maxWidth: undefined, fontSize: 20, minHeight: 56 },
                  descriptionError && styles.inputError
                ]}
                placeholder="Description"
                value={description}
                onChangeText={handleDescriptionChange}
                multiline={false} // make single line like amount
                numberOfLines={1}
                textAlignVertical="center"
              />
              <Pressable
                style={styles.addDebtModalButton}
                onPress={handleAddDebt}
                disabled={adding}
              >
                <Text style={styles.addDebtModalButtonText}>{adding ? 'Adding...' : 'Add Debt'}</Text>
              </Pressable>
              <Pressable onPress={() => setShowAddDebtModal(false)} style={{ marginTop: 4 }}>
                <Text style={styles.addDebtModalCancel}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="none"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animatable.View
              animation="zoomIn"
              duration={300}
              useNativeDriver
              style={[styles.addDebtModalCard, { minWidth: 220 }]}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#d32f2f', marginBottom: 16 }}>Delete Debt?</Text>
              <Text style={{ color: '#333', marginBottom: 24 }}>Are you sure you want to delete this debt?</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <Pressable style={[styles.addDebtModalButton, { backgroundColor: '#d32f2f', flex: 1, marginRight: 8 }]} onPress={confirmDeleteDebt}>
                  <Text style={styles.addDebtModalButtonText}>Delete</Text>
                </Pressable>
                <Pressable style={[styles.addDebtModalButton, { backgroundColor: '#aaa', flex: 1 }]} onPress={() => setDeleteModalVisible(false)}>
                  <Text style={styles.addDebtModalButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </Animatable.View>
          </View>
        </Modal>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', padding: 18 }, // increased padding
  backButton: {
    fontSize: 34, // increased size
    color: '#0d8cae',
    fontWeight: 'bold',
    marginRight: 14,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 24, // increased size
    fontWeight: 'bold',
    color: '#0d8cae',
    marginTop: 6,
    marginBottom: 4,
  },
  totalDebtText: {
    fontSize: 18, // increased size
    fontWeight: 'bold',
    color: '#0d8cae',
    marginBottom: 12,
    marginTop: 12,
    marginLeft: 2,
  },
  addDebtMainButton: {
    backgroundColor: '#93329e',
    borderRadius: 24,
    paddingVertical: 18, // increased
    paddingHorizontal: 38, // increased
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 22,
    shadowColor: '#93329e',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  addDebtMainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20, // increased
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,30,30,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addDebtModalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 36,
    paddingHorizontal: 24, // slightly reduced for more width
    minWidth: 0,
    width: '95%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#93329e',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
    minHeight: 340, // ensure more vertical space
    justifyContent: 'flex-start', // keep content at the top
  },
  addDebtModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d8cae',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  addDebtModalButton: {
    backgroundColor: '#93329e', // Match main +Add Debt button color
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 0,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#93329e',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    width: '100%',
  },
  addDebtModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
    textAlign: 'center',
  },
  addDebtModalCancel: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
    textDecorationLine: 'underline',
    alignSelf: 'center',
  },
  inputGradient: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8, // match Add Customer
    padding: 16, // match Add Customer
    marginBottom: 16,
    fontSize: 20,
    backgroundColor: '#f9f9f9',
    width: '100%',
    minWidth: 0,
    maxWidth: undefined,
    minHeight: 56,
  },
  inputError: {
    borderColor: '#ff1744',
    shadowColor: '#ff1744',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  gradientButton: {
    borderRadius: 24,
    paddingVertical: 12, // increased
    paddingHorizontal: 26, // increased
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100, // increased
    marginLeft: 6,
    shadowColor: '#93329e',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginTop: 0,
    marginBottom: 10,
  },
  gradientButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18, // increased
    letterSpacing: 1,
    textAlign: 'center',
  },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf6fa',
    borderRadius: 10,
    padding: 14, // increased
    marginBottom: 10,
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    width: '100%',
    minWidth: 0,
  },
  debtSerial: {
    fontWeight: 'bold',
    color: '#93329e',
    fontSize: 17, // increased
    minWidth: 32, // increased
    textAlign: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  debtAmount: { fontWeight: 'bold', color: '#0d8cae', fontSize: 18, minWidth: 70, flexShrink: 0 },
  debtDesc: { color: '#333', fontSize: 16, flex: 1, marginHorizontal: 10, minWidth: 0, maxWidth: 140, flexShrink: 1 },
  debtDate: { color: '#888', fontSize: 15, minWidth: 80, textAlign: 'right', flexShrink: 0 },
  logoutButton: {
    marginRight: 0,
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 20,
    alignSelf: 'flex-end',
    shadowColor: '#d32f2f',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteDebtButton: {
    marginLeft: 6,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,23,68,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
