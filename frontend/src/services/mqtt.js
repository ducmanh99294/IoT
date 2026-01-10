import mqtt from "mqtt";

const mqttClient = mqtt.connect(
  import.meta.env.VITE_MQTT_BROKER,
  {
    username: import.meta.env.VITE_MQTT_USERNAME,
    password: import.meta.env.VITE_MQTT_PASSWORD,

    protocol: "wss",
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 30_000,

    clientId: "web_" + Math.random().toString(16).slice(2),
  }
);

mqttClient.on("connect", () => {
  console.log("✅ MQTT Web connected");
  
});

mqttClient.on("reconnect", () => {
  console.log("🔄 MQTT reconnecting...");
  console.log("BROKER =", import.meta.env.VITE_MQTT_BROKER);
});

mqttClient.on("error", (err) => {
  console.error("❌ MQTT error", err.message);
});

export default mqttClient;
