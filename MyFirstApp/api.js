import axios from 'axios';

// Базовый URL вашего API
const API_URL = 'http://172.20.10.7:8000/api/';
const PERENUAL_API_URL = 'https://perenual.com/api/v2/species-list';
const YOUR_PERENUAL_API_KEY = 'sk-G7bf67c1b1dc8f7978888'; // Замените на ваш реальный API-ключ

// Получение списка растений из стороннего API
export const fetchPlantsFromAPI = async (query = '', page = 1) => {
  try {
    const response = await axios.get(PERENUAL_API_URL, {
      params: {
        key: YOUR_PERENUAL_API_KEY,
        q: query.trim(), // Убираем лишние пробелы из запроса
        page: page,
      },
    });

    // Проверяем, есть ли данные в ответе
    if (!response.data || !response.data.data) {
      throw new Error('Некорректный ответ от API');
    }

    return response.data.data; // Возвращаем список растений
  } catch (error) {
    console.error('Ошибка получения растений из API:', error.response?.data || error.message);
    throw error;
  }
};

// Добавление растения в вашу базу данных
export const addPlantFromAPI = async (userToken, plantId, name, description) => {
  try {
    const response = await axios.post('http://192.168.1.100:8000/api/plants/', {
      api_id: plantId, // ID растения из стороннего API
      name: name, // Название растения
      description: description, // Описание растения
    }, {
      headers: { Authorization: `Token ${userToken}` },
    });
    return response.data; // Возвращаем данные о созданном растении
  } catch (error) {
    console.error('Ошибка добавления растения:', error.response?.data || error.message);
    throw error;
  }
};

// Функция для регистрации пользователя
export const registerUser = async (name, username, password, email, phone_number) => {
  try {
    const response = await axios.post(`${API_URL}register/`, {
      name,
      username,
      password,
      email,
      phone_number,
    });
    return response.data.token; // Возвращаем токен (если он есть)
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

// Функция для удаления растения
export const deletePlant = async (token, plantId) => {
  try {
    const response = await axios.delete(`${API_URL}plants/${plantId}/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления растения:', error.response?.data || error.message);
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
