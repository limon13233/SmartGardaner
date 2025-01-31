import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Уведомления</Text>
      {/* Здесь будут уведомления */}
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
});

export default NotificationsScreen;