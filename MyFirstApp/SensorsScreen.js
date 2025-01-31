import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity,Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function SensorsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои датчики</Text>
      {/* Здесь будет информация о датчиках */}
      
      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('Добавить датчик', 'Здесь будет форма для добавления датчика')}>
        <MaterialCommunityIcons name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: '#007BFF',
    borderRadius: 30,
    elevation: 8,
  },
});

export default SensorsScreen;