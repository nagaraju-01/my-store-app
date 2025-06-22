import AsyncStorage from '@react-native-async-storage/async-storage';

export const tokenStorage = {
  async setToken(token: string) {
    await AsyncStorage.setItem('jwtToken', token);
  },
  async getToken() {
    return AsyncStorage.getItem('jwtToken');
  },
  async removeToken() {
    await AsyncStorage.removeItem('jwtToken');
  },
};
