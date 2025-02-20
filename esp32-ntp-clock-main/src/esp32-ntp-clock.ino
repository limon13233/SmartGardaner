#include <WiFi.h>
#include <WiFiClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <qrcode.h>
#include <WebServer.h>
#include <EEPROM.h>

// Настройка OLED дисплея
#define OLED_RESET     -1 // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3c ///< See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32
Adafruit_SSD1306 display(128, 32, &Wire, OLED_RESET);

// Настройка датчика DHT22
#define DHTPIN 5 // Вывод, к которому подключается датчик
#define DHTTYPE DHT22
#define SENSOR_1_PIN 34
DHT dht(DHTPIN, DHTTYPE);

// Настройка точки доступа
const char* apSSID = "ESP32-AP";
const char* apPassword = "12345678";

// Настройка API
const char* api_url = "http://localhost:8000/api/sensor-values/"; // URL вашего Django API
const char* sensor_id = "1"; // ID датчика (замените на актуальное значение)

// Адреса EEPROM для хранения данных
const int EEPROM_SIZE = 256;
const int SSID_ADDR = 0;
const int PASSWORD_ADDR = 64;
const int TOKEN_ADDR = 128;

String ssid = "";
String password = "";
String token = "";

WebServer server(80);
QRCode qrcode;

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

void displayQRCode() {
  display.clearDisplay();
  uint8_t qrcodeData[qrcode_getBufferSize(3)];

  // Формируем строку данных для QR-кода
  String qrData = "WIFI:S:" + String(apSSID) + ";T:WPA;P:" + String(apPassword) + ";;";
  qrcode_initText(&qrcode, qrcodeData, 3, 0, qrData.c_str()); // Генерация QR-кода

  for (uint8_t y = 0; y < qrcode.size; y++) {
    for (uint8_t x = 0; x < qrcode.size; x++) {
      if (qrcode_getModule(&qrcode, x, y)) {
        display.drawPixel(x * 2, y * 2, SSD1306_WHITE);
        display.drawPixel(x * 2 + 1, y * 2, SSD1306_WHITE);
        display.drawPixel(x * 2, y * 2 + 1, SSD1306_WHITE);
        display.drawPixel(x * 2 + 1, y * 2 + 1, SSD1306_WHITE);
      }
    }
  }
  display.display();
}

void handleRoot() {
  server.send(200, "text/plain", "ESP32 Setup Page");
}

void handleSetup() {
  if (server.hasArg("ssid") && server.hasArg("password") && server.hasArg("token")) {
    ssid = server.arg("ssid");
    password = server.arg("password");
    token = server.arg("token");

    // Сохранение данных в EEPROM
    for (int i = 0; i < ssid.length(); i++) {
      EEPROM.write(SSID_ADDR + i, ssid[i]);
    }
    EEPROM.write(SSID_ADDR + ssid.length(), '\0');

    for (int i = 0; i < password.length(); i++) {
      EEPROM.write(PASSWORD_ADDR + i, password[i]);
    }
    EEPROM.write(PASSWORD_ADDR + password.length(), '\0');

    for (int i = 0; i < token.length(); i++) {
      EEPROM.write(TOKEN_ADDR + i, token[i]);
    }
    EEPROM.write(TOKEN_ADDR + token.length(), '\0');

    EEPROM.commit();

    server.send(200, "text/plain", "Settings Saved");
    delay(2000);
    ESP.restart();
  } else {
    server.send(400, "text/plain", "Bad Request");
  }
}

void readCredentialsFromEEPROM() {
  ssid = "";
  password = "";
  token = "";

  char ch;
  int i = 0;
  do {
    ch = EEPROM.read(SSID_ADDR + i);
    if (ch != '\0') {
      ssid += ch;
    }
    i++;
  } while (ch != '\0' && i < 64);

  i = 0;
  do {
    ch = EEPROM.read(PASSWORD_ADDR + i);
    if (ch != '\0') {
      password += ch;
    }
    i++;
  } while (ch != '\0' && i < 64);

  i = 0;
  do {
    ch = EEPROM.read(TOKEN_ADDR + i);
    if (ch != '\0') {
      token += ch;
    }
    i++;
  } while (ch != '\0' && i < 64);
}

void sendSensorDataToAPI(float humidity, float temperature) {
  WiFiClient client;
  if (client.connect("172.20.10.7", 8000)) {
    Serial.println("Connected to API");

    String postData = "{\"sensor\": " + String(sensor_id) + ", \"value\": " + String(temperature) + ", \"timestamp\": \"" + String(millis()) + "\"}";
    String postRequest = String("POST ") + "/api/sensor-values/ HTTP/1.1\r\n" +
                         "Host: 172.20.10.7\r\n" +
                         "Authorization: Token " + token + "\r\n" +
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

void printSensorData() {
  // Читаем данные с датчика DHT22
  float humidity = dht.readHumidity(); // Влажность
  float temperature = dht.readTemperature(); // Температура

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

  display.setCursor(0, 16);
  display.print(F("Hum: "));
  display.print(humidity);
  display.print(F(" %"));
  display.display();

  // Отправляем данные на сервер
  sendSensorDataToAPI(humidity, temperature);
}

void setup() {
  Serial.begin(115200);
  dht.begin(); // Инициализация датчика DHT22

  // Инициализация OLED дисплея
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("SSD1306 allocation failed");
    for(;;); // Don't proceed, loop forever
  }
  display.display();
  delay(2000);
  display.clearDisplay();

  // Инициализация EEPROM
  EEPROM.begin(EEPROM_SIZE);

  // Чтение данных из EEPROM
  readCredentialsFromEEPROM();

  // Проверка наличия токена
  if (token.length() == 0) {
    // Настройка точки доступа
    WiFi.softAP(apSSID, apPassword);
    Serial.println("AP started");
    Serial.print("IP address: ");
    Serial.println(WiFi.softAPIP());

    // Настройка веб-сервера
    server.on("/", handleRoot);
    server.on("/setup", HTTP_POST, handleSetup);
    server.begin();

    displayQRCode(); // Отображение QR-кода, если токен отсутствует
  } else {
    // Подключение к Wi-Fi
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.print(F("Connecting to "));
    display.setCursor(0, 16);
    display.print(F("WiFi "));
    display.display();

    WiFi.begin(ssid, password); // Подключение к Wi-Fi
    while (WiFi.status() != WL_CONNECTED) {
      delay(250);
      spinner();
      display.display();
    }

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
  }
}

void loop() {
  if (token.length() > 0) {
    int sensor1Value = analogRead(SENSOR_1_PIN);
    int digitalSensorValue = digitalRead(DHTPIN);

    if (sensor1Value == HIGH) {
      Serial.println("Sensor 1 is connected.");
    }

    if (digitalSensorValue == HIGH) {
      Serial.println("Sensor 2 is connected.");
    }
    // Вызываем функцию для чтения данных с датчика и отправки их на сервер
    printSensorData();

    // Ждем 5 секунд перед следующей отправкой
    delay(5000);
  }
  server.handleClient();
}
