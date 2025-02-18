import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from './AuthContext';
import { addPlant, getPlants } from './api';

export default function PlantsScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Состояние модального окна
  const [plantName, setPlantName] = useState(''); // Название растения
  const [plantDescription, setPlantDescription] = useState(''); // Описание растения
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const { userToken } = useContext(AuthContext);

  useEffect(() => {
    if (userToken) {
      fetchPlants();
    }
  }, [userToken]);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const plantsData = await getPlants(userToken);
      setPlants(plantsData);
    } catch (error) {
      console.error('Ошибка получения растений:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlant = async () => {
    try {
      if (!plantName.trim() || !plantDescription.trim()) {
        alert('Пожалуйста, заполните все поля.');
        return;
      }

      await addPlant(userToken, plantName, plantDescription);
      setPlants((prevPlants) => [
        ...prevPlants,
        { id: Date.now(), name: plantName, description: plantDescription }, // Временная запись для обновления UI
      ]);
      setModalVisible(false); // Закрываем модальное окно
      alert('Растение успешно добавлено!');
      fetchPlants(); // Обновляем данные с сервера
    } catch (error) {
      console.error('Ошибка добавления растения:', error.response?.data || error.message);
      alert('Не удалось добавить растение.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.plantItem} onPress={() => alert(`${item.name}\n${item.description}`)}>
            <Text style={styles.plantName}>{item.name}</Text>
            <Text style={styles.plantDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Нет растений</Text>}
      />

      {/* Кнопка "Добавить растение" */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Модальное окно для добавления растения */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Добавить растение</Text>
            <TextInput
              placeholder="Название"
              value={plantName}
              onChangeText={setPlantName}
              style={styles.input}
            />
            <TextInput
              placeholder="Описание"
              value={plantDescription}
              onChangeText={setPlantDescription}
              style={styles.input}
              multiline
            />
            <View style={styles.modalButtons}>
              <Button title="Отмена" onPress={() => setModalVisible(false)} />
              <Button title="Добавить" onPress={handleAddPlant} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  plantItem: {
    flex: 1,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  plantName: {
    textAlign:'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  plantDescription: {
    textAlign:'center',
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
