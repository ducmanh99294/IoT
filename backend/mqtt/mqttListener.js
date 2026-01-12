// mqttListener.js
const Light = require("../models/light");

module.exports = (mqttClient) => {
  mqttClient.subscribe("iot/status/123/light-1");

  mqttClient.on("message", async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
    //   const [, , userId, deviceId] = topic.split("/");
        const deviceId = "691abca24e19aa7c079bb105"
      const status = data.status === "on";

      await Light.findOneAndUpdate(
        { _id: deviceId },
        {
          status,
          lastUpdated: new Date(),
        },
        { new: true }
      );

      console.log(`✅ Mongo updated: ${deviceId} = ${status}`);
    } catch (err) {
      console.error("MQTT STATUS error:", err);
    }
  });
};
