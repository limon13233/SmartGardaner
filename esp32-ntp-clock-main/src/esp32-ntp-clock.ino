#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// Настройка OLED дисплея
#define OLED_RESET -1 // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C ///< See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32
Adafruit_SSD1306 display(128, 32, &Wire, OLED_RESET);

// Настройка датчика DHT22
#define DHTPIN 5 // Вывод, к которому подключается датчик
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Настройка датчика влажности почвы
#define SOIL_MOISTURE_PIN 36

// Настройка фотоэлемента (датчика освещенности)
#define LIGHT_SENSOR_PIN 39

// Настройка реле
const int relayPump = 25;    // Насос
const int relayExhaust = 26; // Вытяжка
const int relayIntake = 27;  // Приточка

// Заглушка для требований растения
const float soilMoistureThreshold = 30.0; // Пороговая влажность почвы (%)
const int lightLevelThreshold = 70;      // Пороговый уровень освещенности (%)

// Настройка Wi-Fi
const char* ssid = "Wokwi-GUEST"; // Замените на ваш SSID
const char* password = "";        // Замените на ваш пароль

// Настройка API
const char* api_url = "http://172.20.10.7:8000/api/sensor-values/"; // URL вашего Django API
const char* sensor_id = "1"; // ID датчика (замените на актуальное значение)

void spinner() {
  static int8_t counter = 0;
  const char* glyphs = "\xa1\xa5\xdb";
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(115, 56);
  display.print(glyphs[counter++]);
  if (counter == strlen(glyphs)) {
    counter = 0;
  }
  display.display();
}

void sendSensorDataToAPI(float humidity, float temperature, float soilMoisture, int lightLevel) {
  WiFiClient client;
  if (client.connect("172.20.10.7", 8000)) { // Замените IP-адрес на актуальный
    Serial.println("Connected to API");

    String postData = "{\"sensor\": " + String(sensor_id) + ", \"value\": " + String(temperature, 2) + ", \"timestamp\": \"" + getFormattedTime() + "\"}";
    String postRequest = String("POST ") + "/api/sensor-values/ HTTP/1.1\r\n" +
                         "Host: 172.20.10.7\r\n" + // Замените IP-адрес на актуальный
                         "Content-Type: application/json\r\n" +
                         "Content-Length: " + postData.length() + "\r\n" +
                         "Connection: close\r\n\r\n" +
                         postData;

    client.print(postRequest);

    unsigned long timeout = millis();
    while (client.available() == 0) {
      if (millis() - timeout > 5000) {
        Serial.println(">>> Client Timeout !");
        client.stop();
        return;
      }
    }

    while (client.available()) {
      String line = client.readStringUntil('\r');
      Serial.print(line);
    }

    Serial.println();
    Serial.println("Closing connection");
  } else {
    Serial.println("Connection to API failed");
  }
}

String getFormattedTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "";
  }
  char buffer[20];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  return String(buffer);
}

void controlRelays(float soilMoisture, int lightLevel) {
  // Управление насосом (полив)
  if (soilMoisture < soilMoistureThreshold) {
    digitalWrite(relayPump, HIGH); // Включаем насос
    Serial.println("Pump ON");
  } else {
    digitalWrite(relayPump, LOW); // Выключаем насос
    Serial.println("Pump OFF");
  }

  // Управление вытяжкой (освещение)
  if (lightLevel > lightLevelThreshold) {
    digitalWrite(relayExhaust, HIGH); // Включаем вытяжку
    Serial.println("Exhaust Fan ON");
  } else {
    digitalWrite(relayExhaust, LOW); // Выключаем вытяжку
    Serial.println("Exhaust Fan OFF");
  }

  // Управление приточной вентиляцией (опционально)
  digitalWrite(relayIntake, HIGH); // Приточная вентиляция всегда включена
  Serial.println("Intake Fan ON");
}

void printSensorData() {
  // Читаем данные с датчиков
  float humidity = dht.readHumidity(); // Влажность воздуха
  float temperature = dht.readTemperature(); // Температура
  float soilMoisture = analogRead(SOIL_MOISTURE_PIN); // Влажность почвы
  soilMoisture = map(soilMoisture, 0, 4095, 100, 0); // Преобразуем значение в проценты

  int lightLevel = analogRead(LIGHT_SENSOR_PIN); // Уровень освещенности
  lightLevel = map(lightLevel, 0, 4095, 100, 0); // Преобразуем значение в проценты

  // Проверяем корректность данных
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println(F("Sensor Error"));
    display.setCursor(0, 16);
    display.println(F("Check DHT22"));
    display.display();
    return;
  }

  // Выводим данные на OLED
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0, 0);
  display.print(F("Temp: "));
  display.print(temperature);
  display.print(F(" C"));

  display.setCursor(0, 8);
  display.print(F("Hum: "));
  display.print(humidity);
  display.print(F(" %"));

  display.setCursor(0, 16);
  display.print(F("Soil Hum: "));
  display.print(soilMoisture);
  display.print(F(" %"));

  display.setCursor(0, 24);
  display.print(F("Light: "));
  display.print(lightLevel);
  display.print(F(" %"));

  display.display();

  // Отправляем данные на сервер
  sendSensorDataToAPI(humidity, temperature, soilMoisture, lightLevel);

  // Управляем реле
  controlRelays(soilMoisture, lightLevel);
}

void setup() {
  Serial.begin(115200);

  // Инициализация OLED дисплея
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("SSD1306 allocation failed");
    for (;;) { // Не продолжаем работу, если дисплей не инициализирован
    }
  }
  display.display();
  delay(2000);
  display.clearDisplay();

  // Инициализация датчика DHT22
  dht.begin();

  // Инициализация реле
  pinMode(relayPump, OUTPUT);
  pinMode(relayExhaust, OUTPUT);
  pinMode(relayIntake, OUTPUT);

  // Подключение к Wi-Fi
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print(F("Connecting to "));
  display.setCursor(0, 16);
  display.print(F("WiFi "));
  display.display();

  WiFi.begin(ssid, password); // Подключение к Wi-Fi

  int connectionAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && connectionAttempts < 10) {
    delay(250);
    spinner();
    display.display();
    connectionAttempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    // После подключения очищаем экран OLED
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println(F("Online"));
    display.setCursor(0, 16);
    display.println(F("Updating..."));
    display.display();
  } else {
    Serial.println("Failed to connect to WiFi!");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println(F("WiFi Error"));
    display.setCursor(0, 16);
    display.println(F("Check Settings"));
    display.display();
    ESP.restart(); // Перезапускаем устройство при неудачном подключении
  }
}

void loop() {
  // Вызываем функцию для чтения данных с датчиков и отправки их на сервер
  printSensorData();

  // Ждем 5 секунд перед следующей отправкой
  delay(5000);
}