#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

/* ================= WIFI ================= */
const char* WIFI_SSID = "Binh-Quan-Manh";
const char* WIFI_PASS = "123456789";

/* ================= MQTT ================= */
const char* MQTT_HOST = "b254dad9169a47c5b94f91cb48228f07.s1.eu.hivemq.cloud";
const int   MQTT_PORT = 8883;
const char* MQTT_USER = "ducsmanh";
const char* MQTT_PASS = "AzO932550957";

/* ================= DEVICE ================= */
#define USER_ID   "123"
#define DEVICE_ID "light-1"

/* ================= TOPIC ================= */
String CMD_TOPIC    = "iot/command/" + String(USER_ID) + "/" + String(DEVICE_ID);
String STATUS_TOPIC = "iot/status/"  + String(USER_ID) + "/" + String(DEVICE_ID);

/* ================= PIN ================= */
#define RELAY_PIN 26

/* ================= STATE ================= */
bool lightStatus = false;

/* ================= MQTT CLIENT ================= */
WiFiClientSecure espClient;
PubSubClient client(espClient);

/* ================= WIFI CONNECT ================= */
void setup_wifi() {
  Serial.print("🔌 Connecting WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi connected");
  Serial.println(WiFi.localIP());
}

/* ================= PUBLISH STATUS ================= */
void publishStatus() {
  StaticJsonDocument<64> doc;
  doc["status"] = lightStatus ? "on" : "off";

  char buffer[64];
  serializeJson(doc, buffer);

  client.publish(STATUS_TOPIC.c_str(), buffer, true);
  Serial.println("📤 Status sent");
}

/* ================= MQTT CALLBACK ================= */
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  Serial.println("📩 " + String(topic) + ": " + msg);

  StaticJsonDocument<128> doc;
  if (deserializeJson(doc, msg)) return;

  String status = doc["status"];

  if (status == "on") {
    digitalWrite(RELAY_PIN, HIGH);
    lightStatus = true;
  } else {
    digitalWrite(RELAY_PIN, LOW);
    lightStatus = false;
  }

  publishStatus();
}

/* ================= MQTT RECONNECT ================= */
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("🔄 Connecting MQTT...");
    if (client.connect("ESP32_LIGHT_1", MQTT_USER, MQTT_PASS)) {
      Serial.println(" ✅ connected");
      client.subscribe(CMD_TOPIC.c_str());
      publishStatus();
    } else {
      Serial.print(" ❌ failed rc=");
      Serial.println(client.state());
      delay(3000);
    }
  }
}

/* ================= SETUP ================= */
void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  setup_wifi();

  espClient.setInsecure(); // TLS
  client.setServer(MQTT_HOST, MQTT_PORT);
  client.setCallback(mqttCallback);
}

/* ================= LOOP ================= */
void loop() {
  if (!client.connected()) reconnectMQTT();
  client.loop();
}
