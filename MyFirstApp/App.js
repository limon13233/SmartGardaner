import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Компоненты экранов
import LoginScreen from './LoginScreen'; // Предполагаем, что у вас есть этот компонент
import PlantsScreen from './PlantsScreen';
import SensorsScreen from './SensorsScreen';
import NotificationsScreen from './NotificationsScreen';

// Стэк для основного приложения
const Stack = createStackNavigator();

// Нижний навигатор
const Tab = createBottomTabNavigator();

function HomeTabs({ navigation }) {
  const [title, setTitle] = useState('Растения');

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener('tabPress', (e) => {
        if (e.target === 'Растения') {
          setTitle('Растения');
        } else if (e.target === 'Датчики') {
          setTitle('Датчики');
        }
      });

      return unsubscribe;
    }, [navigation])
  );

  useEffect(() => {
    navigation.setOptions({
      title: title,
    });
  }, [title, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Растения') {
            iconName = focused ? 'leaf' : 'leaf';
          } else if (route.name === 'Датчики') {
            iconName = focused ? 'chart-bubble' : 'chart-bubble';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        headerShown: false, // Скрываем заголовки для вкладок
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Растения" component={PlantsScreen} />
      <Tab.Screen name="Датчики" component={SensorsScreen} />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeTabs} 
        options={({ navigation }) => ({
          headerRight: () => (
            <MaterialCommunityIcons
              name="bell"
              size={24}
              color="black"
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('Notifications')}
            />
          ),
          headerShown: true // Убедитесь, что заголовок отображается
        })} 
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="App" component={AppStack} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}