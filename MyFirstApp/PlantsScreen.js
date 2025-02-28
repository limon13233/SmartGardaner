import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Button,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from './AuthContext';
import { addPlant, fetchPlantsFromAPI, getPlants, deletePlant } from './api';

export default function PlantsScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [plantName, setPlantName] = useState('');
  const [plantDescription, setPlantDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiPlants, setApiPlants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingApiPlants, setIsFetchingApiPlants] = useState(false);
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

  const fetchApiPlants = async () => {
    setIsFetchingApiPlants(true);
    try {
      const apiPlantsData = await fetchPlantsFromAPI(searchQuery);
      setApiPlants(apiPlantsData);
    } catch (error) {
      console.error('Ошибка получения растений из API:', error);
    } finally {
      setIsFetchingApiPlants(false);
    }
  };

  const handleAddPlant = async (plant) => {
    try {
      if (!plant || !plant.common_name) {
        alert('Пожалуйста, выберите растение.');
        return;
      }

      await addPlant(userToken, plant.common_name, plant.description || '');
      setPlants((prevPlants) => [
        ...prevPlants,
        { id: Date.now(), name: plant.common_name, description: plant.description || '' },
      ]);
      alert(`Растение "${plant.common_name}" успешно добавлено!`);
      setModalVisible(false);
      fetchPlants();
    } catch (error) {
      console.error('Ошибка добавления растения:', error.response?.data || error.message);
      alert('Не удалось добавить растение.');
    }
  };

  const handleDeletePlant = async (plantId) => {
    try {
      await deletePlant(userToken, plantId);
      setPlants((prevPlants) => prevPlants.filter((plant) => plant.id !== plantId));
      alert('Растение успешно удалено!');
    } catch (error) {
      console.error('Ошибка удаления растения:', error.response?.data || error.message);
      alert('Не удалось удалить растение.');
    }
  };

  const handleLongPress = (plantId) => {
    Alert.alert(
      'Удаление растения',
      'Вы уверены, что хотите удалить это растение?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          onPress: () => handleDeletePlant(plantId),
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      fetchApiPlants();
    } else {
      setApiPlants([]);
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
          <TouchableOpacity
            style={styles.plantItem}
            onPress={() => alert(`${item.name}\n${item.description}`)}
            onLongPress={() => handleLongPress(item.id)}
          >
            <Text style={styles.plantName}>{item.name}</Text>
            <Text style={styles.plantDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Нет растений</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons name="plus" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите или добавьте растение</Text>

            <TextInput
              placeholder="Поиск растений..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              style={styles.input}
            />

            {isFetchingApiPlants ? (
              <ActivityIndicator size="small" color="#007BFF" style={styles.apiLoading} />
            ) : (
              <ScrollView style={styles.apiPlantsList}>
                {apiPlants.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.apiPlantItem}
                    onPress={() => handleAddPlant(item)}
                  >
                    <Text style={styles.apiPlantName}>{item.common_name}</Text>
                    <Text style={styles.apiPlantScientificName}>{item.scientific_name?.join(', ') || 'Нет научного названия'}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.divider}>
              <Text style={styles.dividerText}>Или добавьте свое растение</Text>
            </View>

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
              <Button
                title="Добавить"
                onPress={() => handleAddPlant({ common_name: plantName, description: plantDescription })}
                disabled={!plantName.trim() || !plantDescription.trim()}
              />
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
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  plantDescription: {
    textAlign: 'center',
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
  apiPlantItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  apiPlantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  apiPlantScientificName: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginTop: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  apiLoading: {
    marginVertical: 10,
  },
  apiPlantsList: {
    maxHeight: 200,
    marginBottom: 10,
  },
});
