// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from './AuthContext'; // Импортируем контекст аутентификации

// Компоненты экранов
import LoginScreen from './LoginScreen';
import PlantsScreen from './PlantsScreen';
import SensorsScreen from './SensorsScreen';
import NotificationsScreen from './NotificationsScreen';

// Стэк для основного приложения
const Stack = createStackNavigator();

// Нижний навигатор
const Tab = createBottomTabNavigator();

function HomeTabs({ navigation }) {
  const [title, setTitle] = React.useState('Растения');

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

  // Обновляем заголовок стека
  React.useEffect(() => {
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
        headerShown: false, // Убираем заголовок для вкладок
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
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' }, // Опционально: стиль хедера
        headerTintColor: '#000', // Опционально: цвет текста
      }}
    >
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
          headerShown: true, // Показываем только один общий хедер
        })}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Уведомления' }} // Заголовок для экрана уведомлений
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AuthCheck />
      </NavigationContainer>
    </AuthProvider>
  );
}

function AuthCheck() {
  const { userToken } = React.useContext(AuthContext);

  // Если пользователь не авторизован, показываем экран входа
  if (!userToken) {
    return <LoginScreen />;
  }

  // Если пользователь авторизован, показываем основной экран
  return <AppStack />;
}