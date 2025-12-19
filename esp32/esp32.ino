#include <WiFi.h>
#include <PubSubClient.h>

// ====== WIFI ======
const char* ssid = "Binh-Quan-Manh";
const char* password = "123456789";

// ====== MQTT ======
const char* mqtt_server = "192.168.0.2";
const int mqtt_port = 1883;
const char* CMD_TOPIC    = "home/Đèn hành lang/light/cmd";
const char* STATUS_TOPIC = "home/Đèn hành lang/light/status";
const char* SENSOR_TOPIC = "home/Đèn hành lang/sensor/light";

// ====== PIN ======
#define LED 26  
#define DO_CAMBIEN 27

WiFiClient espClient;
PubSubClient client(espClient);

// ====== MQTT CALLBACK ======
void callback(char* topic, byte* message, unsigned int length) {
  String payload;
  for (int i = 0; i < length; i++) {
    payload += (char)message[i];
  }
  payload.trim();

  if (String(topic) == CMD_TOPIC) {
    if (payload == "ON") {
      digitalWrite(LED, HIGH);
      client.publish(STATUS_TOPIC, "ON");
      Serial.println("ĐÈN BẬT");
    }
    else if (payload == "OFF") {
      digitalWrite(LED, LOW);
      client.publish(STATUS_TOPIC, "OFF");
      Serial.println("ĐÈN TẮT");
    }
  }
}

// ====== WIFI CONNECT ======
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Kết nối WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi đã kết nối");
  Serial.print("IP ESP32: ");
  Serial.println(WiFi.localIP());
}

// ====== MQTT RECONNECT ======
void reconnect() {
  while (!client.connected()) {
    Serial.print("Kết nối MQTT...");

    if (client.connect("ESP32_DEN_HANH_LANG")) {
      Serial.println("MQTT connected");
      client.subscribe(CMD_TOPIC);
      Serial.print("Subscribe: ");
      Serial.println(CMD_TOPIC);
    } else {
      Serial.print("MQTT failed, rc=");
      Serial.print(client.state());
      Serial.println(" → thử lại sau 5s");
      delay(5000);
    }
  }
}

// ====== SETUP ======
void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  digitalWrite(LED, LOW);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// ====== LOOP ======
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // ====== ĐỌC CẢM BIẾN DO ======
  static int lastState = -1;
  int lightState = digitalRead(DO_CAMBIEN);

  if (lightState != lastState) {
    lastState = lightState;

    if (lightState == LOW) {
      client.publish(SENSOR_TOPIC, "bright");
      Serial.println("Trời sáng");
    } else {
      client.publish(SENSOR_TOPIC, "dark");
      Serial.println("Trời tối");
    }
  }
  delay(300);
}
