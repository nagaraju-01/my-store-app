import Constants from 'expo-constants';

// Use environment variable from app config or .env files
const API_BASE = Constants.expoConfig?.extra?.API_URL || 'https://sreejita-kirana-shop.onrender.com'; // fallback for prod

export const api = {
  signIn: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }), // Use 'username' instead of 'email'
    });
    if (!res.ok) throw new Error('Failed login');
    const data = await res.json();
    if (data.state === 'failed') throw new Error(data.error || 'Failed login');
    return data;
    },

    signUp: async (username: string, password: string, confirmPassword: string) => {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, confirmPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      // Forward backend error message if available
      throw new Error(data.error || 'Failed signup');
    }
    return data;
    },

    getCustomers: async (token: string, onUnauthorized?: () => void) => {
    const res = await fetch(`${API_BASE}/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      if (onUnauthorized) onUnauthorized();
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  addCustomer: async (customer: { name: string, contact: string }, token: string) => {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(customer),
    });
    if (!res.ok) throw new Error('Failed to add customer');
    return res.json();
  },

  addDebt: async (
    debt: { amount: number; description: string; customerId: string },
    token: string,
    onUnauthorized?: () => void
  ) => {
    const res = await fetch(`${API_BASE}/debts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        amount: debt.amount,
        description: debt.description,
        customer: { customerId: debt.customerId },
      }),
    });
    if (res.status === 401) {
      if (onUnauthorized) onUnauthorized();
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Failed to add debt');
    return res.json();
  },

  getDebts: async (customerId: number, token: string) => {
    const res = await fetch(`${API_BASE}/customers/${customerId}/debts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch debts');
    return res.json();
  },

  getDebtsByCustomerIdAndPagination: async (customerId: string, token: string, onUnauthorized?: () => void, page: number = 0, size: number = 13) => {
    const res = await fetch(`${API_BASE}/debts/customer/${customerId}?page=${page}&size=${size}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      if (onUnauthorized) onUnauthorized();
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Failed to fetch debts');
    return res.json();
  },

  getDebtsByCustomerId: async (customerId: string, token: string, onUnauthorized?: () => void) => {
    const res = await fetch(`${API_BASE}/debts/customer/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      if (onUnauthorized) onUnauthorized();
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Failed to fetch debts');
    return res.json();
  },

  deleteDebt: async (debtId: string, token: string, onUnauthorized?: () => void) => {
    const res = await fetch(`${API_BASE}/debts/${debtId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      if (onUnauthorized) onUnauthorized();
      throw new Error('Unauthorized');
    }
    if (res.status === 204) return true; // Success, no content
    if (res.status === 404) throw new Error('Debt not found');
    if (!res.ok) throw new Error('Failed to delete debt');
    return true;
  },
};
