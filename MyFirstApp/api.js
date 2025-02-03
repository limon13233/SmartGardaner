import axios from 'axios';

// Базовый URL вашего API
const API_URL = 'http://172.20.10.7:8000/api/';

// Функция для регистрации пользователя
export const registerUser = async (username, password, email, phone_number) => {
  try {
    const response = await axios.post(`${API_URL}register/`, {
      username,
      password,
      email,
      phone_number,
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка регистрации:', error.response?.data || error.message);
    throw error;
  }
};

// Функция для входа пользователя
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}login/`, {
      username,
      password,
    });
    console.error(response.data.token);
    return response.data.token; // Возвращаем токен аутентификации
  } catch (error) {
    console.error('Ошибка входа:', error.response?.data || error.message);
    throw error;
  }
};

// Функция для получения списка растений
export const getPlants = async (token) => {
  try {
    const response = await axios.get(`${API_URL}plants/`, {
      headers: { Authorization: `Token ${token}` },
    });
    // console.error(response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения растений:', error.response?.data || error.message);
    throw error;
  }
};

// Функция для добавления нового растения
export const addPlant = async (token, name, description) => {
  try {
    const response = await axios.post(
      `${API_URL}plants/`,
      { name, description },
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка добавления растения:', error.response?.data || error.message);
    throw error;
  }
};

// Функция для привязки датчика к растению
export const bindSensorToPlant = async (token, sensorId, plantId) => {
  try {
    const response = await axios.post(
      `${API_URL}sensors/${sensorId}/bind_plant/`,
      { plant_id: plantId },
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка привязки датчика:', error.response?.data || error.message);
    throw error;
  }
};