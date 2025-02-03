// storage.js

import AsyncStorage from '@react-native-async-storage/async-storage';

// Сохранение токена
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Ошибка сохранения токена:', error);
  }
};

// Получение токена
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Ошибка получения токена:', error);
  }
};

// Удаление токена
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Ошибка удаления токена:', error);
  }
};