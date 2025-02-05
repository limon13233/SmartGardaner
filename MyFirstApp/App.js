import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from './AuthContext'; // Импортируем контекст аутентификации

// Компоненты экранов
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen'; // Импортируем экран регистрации
import PlantsScreen from './PlantsScreen';
import SensorsScreen from './SensorsScreen';
import NotificationsScreen from './NotificationsScreen';
import { View } from 'react-native-web';
import { useNavigation } from '@react-navigation/native';

// Стэк для основного приложения
const Stack = createStackNavigator();

// Нижний навигатор
const Tab = createBottomTabNavigator();

function HomeTabs() {
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
  const { logout } = React.useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      if (e.data.state.index === 0 && e.data.state.routes[0].name === 'Login') {
        logout();
      }
    });

    return unsubscribe;
  }, [navigation]);

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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="bell"
                size={24}
                color="black"
                style={{ marginRight: 15 }}
                onPress={() => navigation.navigate('Notifications')}
              />
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color="black"
                onPress={async () => {
                  await logout(); // Вызываем метод logout
                  navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // Переходим на экран входа
                }}
              />
            </View>
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
  const { userToken, loading } = React.useContext(AuthContext);

  if (loading) {
    return null; // Показываем загрузку или пустой экран, пока токен загружается
  }

  // Если пользователь не авторизован, показываем экран входа
  if (!userToken) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} // Скрываем хедер для экрана входа
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }} // Скрываем хедер для экрана регистрации
        />
      </Stack.Navigator>
    );
  }

  // Если пользователь авторизован, показываем основной экран
  return <AppStack />;
}
