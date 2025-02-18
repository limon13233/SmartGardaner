// Learn about the ESP32 WiFi simulation in
// https://docs.wokwi.com/guides/esp32-wifi

#include <WiFi.h>
#include <WiFiClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
//#include <HTTPClient.h> // Библиотека для работы с HTTP-запросами

// Настройка LCD
LiquidCrystal_I2C LCD = LiquidCrystal_I2C(0x27, 16, 2);

// Настройка датчика DHT22
#define DHTPIN 5 // Вывод, к которому подключается датчик
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Настройка Wi-Fi
const char* ssid = "Wokwi-GUEST"; // SSID сети Wi-Fi
const char* password = ""; // Пароль сети Wi-Fi

// Настройка API
const char* api_url = "http://172.20.10.7:8000/api/sensor-values/"; // URL вашего Django API
const char* sensor_id = "1"; // ID датчика (замените на актуальное значение)
const char* token = "1125cb15f8412610e351eca346d5918e0688a34c"; // Токен аутентификации пользователя

void spinner() {
  static int8_t counter = 0;
  const char* glyphs = "\xa1\xa5\xdb";
  LCD.setCursor(15, 1);
  LCD.print(glyphs[counter++]);
  if (counter == strlen(glyphs)) {
    counter = 0;
  }
}

void sendSensorDataToAPI(float humidity, float temperature) {
  // Создаем HTTP-клиент
  //HTTPClient http;

  // Формируем JSON-данные
  String postData = "{ \"sensor\": " + String(sensor_id) + ", \"value\": " + String(humidity, 2) + " }";

  // Отправляем данные на сервер
  //http.begin(api_url); // Указываем URL API
  //http.addHeader("Content-Type", "application/json");
  //http.addHeader("Authorization", "Token " + String(token));

  //int httpResponseCode = http.POST(postData);

  //if (httpResponseCode > 0) {
  //   Serial.printf("[HTTP] POST... code: %d\n", httpResponseCode);
  //   String response = http.getString();
  //   Serial.println(response);

  //   // Выводим успех на LCD
  //   LCD.clear();
  //   LCD.setCursor(0, 0);
  //   LCD.print("Data sent!");
  //   LCD.setCursor(0, 1);
  //   LCD.print("Hum:");
  //   LCD.print(humidity);
  //   LCD.print(" %");
  // } else {
  //   Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpResponseCode).c_str());

  //   // Выводим ошибку на LCD
  //   LCD.clear();
  //   LCD.setCursor(0, 0);
  //   LCD.print("Error sending data");
  //   LCD.setCursor(0, 1);
  //   LCD.print("Check connection");
  // }

  // // Закрываем соединение
  // http.end();
}

void printSensorData() {
  // Читаем данные с датчика DHT22
  float humidity = dht.readHumidity(); // Влажность
  float temperature = dht.readTemperature(); // Температура

  // Проверяем корректность данных
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    LCD.clear();
    LCD.setCursor(0, 0);
    LCD.print("Sensor Error");
    LCD.setCursor(0, 1);
    LCD.print("Check DHT22");
    return;
  }

  // Выводим данные на LCD
  LCD.clear();
  LCD.setCursor(0, 0);
  LCD.print("Temp:");
  LCD.print(temperature);
  LCD.print(" C");

  LCD.setCursor(0, 1);
  LCD.print("Hum:");
  LCD.print(humidity);
  LCD.print(" %");

  // Отправляем данные на сервер
  sendSensorDataToAPI(humidity, temperature);
}

void setup() {
  Serial.begin(115200);
  dht.begin(); // Инициализация датчика DHT22
  LCD.init(); // Инициализация LCD
  LCD.backlight(); // Включение подсветки LCD

  // Подключение к Wi-Fi
  LCD.setCursor(0, 0);
  LCD.print("Connecting to ");
  LCD.setCursor(0, 1);
  LCD.print("WiFi ");

  WiFi.begin(ssid, password); // Подключение к Wi-Fi
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    spinner(); // Показываем спиннер во время подключения
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // После подключения очищаем экран LCD
  LCD.clear();
  LCD.setCursor(0, 0);
  LCD.println("Online");
  LCD.setCursor(0, 1);
  LCD.println("Updating...");
}

void loop() {
  // Вызываем функцию для чтения данных с датчика и отправки их на сервер
  printSensorData();

  // Ждем 5 секунд перед следующей отправкой
  delay(5000);
}