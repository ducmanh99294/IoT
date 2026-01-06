const mqtt = require("mqtt");
const scheduleRunner = require("./scheduleRunner");

const MQTT_BROKER = "mqtt://172.20.13.153:1883";

// ===== STATE TOÀN CỤC ======
const IoTState = {
  ambient: null,
  light: null,

  chatMessage: '',
  lastAskedAt: null,
  confirm: false,
};
// ===== MQTT CLIENT ======
const client = mqtt.connect(MQTT_BROKER);

// ===== HELPER =====
const COOLDOWN = 30 * 60 * 1000; // 30 phút

const canAskAgain = () => {

  if (!IoTState.lastAskedAt) return true;
  return Date.now() - IoTState.lastAskedAt > COOLDOWN;
}

const createSystemChat = (suggestion) => {
  IoTState.chatMessage = {
    suggestion
  };

  IoTState.lastAskedAt = Date.now();

  console.log("SYSTEM CHAT:", suggestion);
}

// ===== MQTT EVENTS =====
client.on("connect", () => {
  console.log("MQTT connected!");

  scheduleRunner(client);

  client.subscribe([
    "home/Đèn hành lang/sensor/light",
    "home/Đèn hành lang/light/status",
  ]);
});

client.on("message", (topic, message) => {
  const payload = message.toString();
  console.log(`MQTT ${topic}: ${payload}`);

  // ===== SENSOR =====
  if (topic === "home/Đèn hành lang/sensor/light") {
    IoTState.ambient = payload;
  }

  // ===== LIGHT STATUS =====
  if (topic === "home/Đèn hành lang/light/status") {
    IoTState.light = payload;
  }

  // ===== LOGIC CHAT TỰ ĐỘNG =====
  if (!IoTState.confirm && canAskAgain()) {
    if (IoTState.ambient === "dark" && IoTState.light === "OFF") {
      createSystemChat("Trời tối rồi, bạn có muốn bật đèn không?");
    }

    if (IoTState.ambient === "bright" && IoTState.light === "ON") {
      createSystemChat("Trời sáng rồi, bạn có muốn tắt đèn không?");
    }
  }
});

// ===== EXPORT =====
module.exports = {
  mqttClient: client,
  IoTState,
};
