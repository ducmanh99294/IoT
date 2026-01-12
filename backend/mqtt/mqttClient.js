// mqtt/mqttClient.js
const mqtt = require("mqtt");

const mqttClient = mqtt.connect(
  "wss://b254dad9169a47c5b94f91cb48228f07.s1.eu.hivemq.cloud:8884/mqtt",
  {
    username: "ducsmanh",
    password: "AzO932550957",

    protocol: "wss",
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 30_000,

    clientId: "web_" + Math.random().toString(16).slice(2),
  }
);

mqttClient.on("connect", () => {
  console.log("✅ MQTT connected (backend)");
});

mqttClient.on("error", (err) => {
  console.error("❌ MQTT error:", err);
});

module.exports = mqttClient;
