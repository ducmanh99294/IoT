

#include <WiFi.h>
#include <PubSubClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// ---------- CẤU HÌNH ----------
const char* ssid = "Binh Quan Manh";
const char* password = "123456789";
const char* mqtt_server = "192.168.0.5"; 

#define LED_PIN     13  
#define LDR_AO_PIN  34  
#define LDR_DO_PIN  27 

WiFiClient espClient;
PubSubClient client(espClient);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7*3600, 60000); 

// ---------- TRẠNG THÁI & CẤU HÌNH LẠI ---------
bool lightOn = false;
String mode = "auto"; 
String scheduledOn = "22:00";
String scheduledOff = "06:00";
int ldrThreshold = 1500; 
unsigned long lastAOPublish = 0;
const unsigned long AOPUBLISH_INTERVAL = 15000; 

// ---------- MQTT TOPIC ----------
const char* topic_control = "home/light1";
const char* topic_status  = "home/light1/status";
const char* topic_ao      = "home/light1/lux";

// ---------- HÀM HỖ TRỢ ----------
void publishStatus(const char* s) {
  client.publish(topic_status, s);
}

String getHHMM() {
  String t = timeClient.getFormattedTime(); // "HH:MM:SS"
  return t.substring(0,5);
}

// ---------- MQTT CALLBACK ----------
void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (unsigned int i=0;i<length;i++) msg += (char)payload[i];
  Serial.print("MQTT recv ["); Serial.print(topic); Serial.print("] -> "); Serial.println(msg);

  if (String(topic) == String(topic_control)) {
    if (msg == "ON") {
      lightOn = true;
      digitalWrite(LED_PIN, HIGH);
      publishStatus("ON");
      mode = "manual";
    } else if (msg == "OFF") {
      lightOn = false;
      digitalWrite(LED_PIN, LOW);
      publishStatus("OFF");
      mode = "manual";
    } else if (msg.startsWith("SCHEDULE:")) {
      int p = msg.indexOf(':');
      String times = msg.substring(p+1);
      int dash = times.indexOf('-');
      if (dash>0 && times.length()>=11) {
        scheduledOn = times.substring(0,5);
        scheduledOff = times.substring(dash+1, dash+6);
        Serial.print("Schedule set "); Serial.print(scheduledOn); Serial.print(" -> "); Serial.println(scheduledOff);
        publishStatus(("SCHEDULE:"+scheduledOn+"-"+scheduledOff).c_str());
      }
    } else if (msg.startsWith("MODE:")) {
      String m = msg.substring(5);
      if (m=="auto"||m=="manual") {
        mode = m;
        publishStatus(("MODE:"+mode).c_str());
      }
    } else if (msg.startsWith("THRESH:")) {
      String v = msg.substring(7);
      int val = v.toInt();
      if (val>0 && val<4096) {
        ldrThreshold = val;
        Serial.print("Threshold updated: "); Serial.println(ldrThreshold);
        publishStatus(("THRESH:"+String(ldrThreshold)).c_str());
      }
    }
  }
}

// ---------- KẾT NỐI MQTT ----------
void reconnect() {
  while (!client.connected()) {
    Serial.print("MQTT connecting...");
    if (client.connect("esp32_smartlight")) {
      Serial.println("connected");
      client.subscribe(topic_control);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retry in 5s");
      delay(5000);
    }
  }
}

// ---------- SETUP & LOOP ----------
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  pinMode(LDR_DO_PIN, INPUT);

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi connected, IP: " + WiFi.localIP().toString());

  // NTP & MQTT
  timeClient.begin();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void checkSchedule() {
  String now = getHHMM();
  static String lastActionMinute = "";
  if (now != lastActionMinute) {
    lastActionMinute = now;
    if (mode == "auto") {
      if (now == scheduledOn && !lightOn) {
        lightOn = true; digitalWrite(LED_PIN, HIGH);
        publishStatus("Auto ON (Schedule)");
      } else if (now == scheduledOff && lightOn) {
        lightOn = false; digitalWrite(LED_PIN, LOW);
        publishStatus("Auto OFF (Schedule)");
      }
    }
  }
}

void checkLDR() {
  int lux = analogRead(LDR_AO_PIN);
  if (millis() - lastAOPublish > AOPUBLISH_INTERVAL) {
    lastAOPublish = millis();
    client.publish(topic_ao, String(lux).c_str());
  }

  int doVal = digitalRead(LDR_DO_PIN); 
  if (mode == "auto") {
    if ((lux < ldrThreshold || doVal == 1) && !lightOn) {
      lightOn = true; digitalWrite(LED_PIN, HIGH);
      publishStatus("Auto ON (LDR)");
    } else if ((lux >= ldrThreshold && doVal == 0) && lightOn) { 
      lightOn = false; digitalWrite(LED_PIN, LOW);
      publishStatus("Auto OFF (LDR)");
    }
  }
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  timeClient.update();
  checkSchedule();
  checkLDR();

  delay(200); 
}
