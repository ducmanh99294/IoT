const mqtt = require("mqtt");

const MQTT_BROKER = "mqtt://192.168.0.5";
const MQTT_PORT = 1883;

const client = mqtt.connect(`${MQTT_BROKER}:${MQTT_PORT}`);

client.on("connect", () => {
  console.log("✅ MQTT connected!");
  client.subscribe('home/light1/lux');
  client.subscribe("home/light1/status", (err) => {
    if (!err) console.log("📡 Subscribed to home/light1/status");
  });
});

client.on('message', (topic, message) => {
  if (topic === 'home/light1/lux') {
    const lux = parseFloat(message.toString());
    console.log(`🌤️ Cường độ ánh sáng: ${lux} lux`);

    // Tự động bật/tắt đèn theo ngưỡng ánh sáng
    if (lux < 300) {
      client.publish('home/light1', 'ON');
    } else if (lux > 700) {
      client.publish('home/light1', 'OFF');
    }
  }
  console.log(`📩 MQTT message: ${topic} = ${message.toString()}`);
});
module.exports = client;
