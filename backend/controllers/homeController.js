const Light = require('../models/light');
const { IoTState } = require('../mqtt/mqttClient');
const TOPIC_CMD = "home/Đèn hành lang/light/cmd";

exports.sendCommand = async (req, res) => {
  const { command } = req.body;
  const mqttClient = req.app.get("mqttClient");
  if (!mqttClient.connected) {
    return res.status(500).json({ message: "MQTT not connected" });
  }

  try {
    // Gửi lệnh qua MQTT
    mqttClient.publish(process.env.MQTT_TOPIC_COMMAND || TOPIC_CMD, command);
    console.log(`Sent command: ${command}`);

    // Cập nhật trạng thái đèn trong DB
    const status = command.toUpperCase() === 'ON';
    await Light.findOneAndUpdate(
      { name: 'light1' }, 
      { status, lastUpdated: new Date() }, 
      { upsert: true, new: true }
    );

    res.json({ success: true, command });
  } catch (error) {
    console.error('Error sending command:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi gửi lệnh' });
  }
};

exports.controlLight = async (req, res) => {
  const { id } = req.params;      
  const { status, name } = req.body;     
  const normalizedCommand = status?.toUpperCase();

  if (!["ON", "OFF"].includes(normalizedCommand)) {
    return res.status(400).json({ error: "Command phải là 'ON' hoặc 'OFF'" });
  }
  const mqttClient = req.app.get("mqttClient");
  if (!mqttClient || !mqttClient.connected) {
    return res.status(500).json({ message: "MQTT not connected" });
  }

  try {
    const topic = `home/${name}/light/cmd`;
    mqttClient.publish(topic, normalizedCommand);
    console.log(`Gửi lệnh: ${normalizedCommand} ➜ topic: ${topic}`);

    const status = normalizedCommand === "ON";

    const updatedLight = await Light.findOneAndUpdate(
      { _id: id },                    
      { status, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Đèn '${id}' đã ${status ? "bật" : "tắt"}`,
      data: updatedLight
    });

  } catch (error) {
    console.error("Error controlling light:", error);
    res.status(500).json({ success: false, message: "Lỗi khi điều khiển đèn" });
  }
};

exports.scheduleLight = (req, res) => {
  const { id } = req.params;
  const { status, name, time } = req.body;

  const mqttClient = req.app.get("mqttClient");

  let targetTime = new Date(time);  // nhận ISO hoặc HH:mm

  if (isNaN(targetTime.getTime())) {
    return res.status(400).json({ message: "Time không hợp lệ" });
  }

  const now = new Date();
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const delay = targetTime - now;
  const cmd = status ? "ON" : "OFF";
  const topic = `home/${name}/light/cmd`;


  setTimeout(() => {

    if (!mqttClient.connected) {
      mqttClient.reconnect();
    }

    mqttClient.publish(topic, cmd, { qos: 1 }, async (error) => {
      if (error) {
        console.error("MQTT publish error:", error);
        return;
      }

      try {
        const updated = await Light.findByIdAndUpdate(
          id,
          { 
            status: cmd === "ON",
            lastUpdated: new Date()
          },
          { new: true }
        );

        console.log("Đã cập nhật trạng thái DB:", {
          name: updated?.name,
          status: updated?.status
        });

      } catch (dbErr) {
        console.error("Lỗi cập nhật DB:", dbErr);
      }
    });

  }, delay);

  res.json({
    success: true,
    message: `Đã đặt lịch ${status ? "Bật" : "Tắt"} vào ${targetTime.toLocaleString()}`,
  });
};

exports.scheduleDelay = (req, res) => {
  const { id } = req.params;
  const { status, name, delay } = req.body;

  const mqttClient = req.app.get("mqttClient");

  const cmd = status.toLowerCase() === "on" ? "ON" : "OFF";

  const topic = `home/${name}/light/cmd`;

  if (!delay || delay <= 0) {
    return res.status(400).json({ message: "Delay không hợp lệ" });
  }

  console.log("Delay schedule:", { id, delayMs: delay });

  setTimeout(() => {
    console.log("Delay triggered:", { topic, cmd });

    if (!mqttClient.connected) {
      console.log("MQTT lost connection. Reconnecting...");
      mqttClient.reconnect();
    }

    mqttClient.publish(topic, cmd, { qos: 1 }, async (error) => {
      if (error) {
        console.log("MQTT publish error:", error);
        return;
      }

      console.log(`📡 Đã gửi lệnh ${cmd} đến ${topic}`);

      try {
        const updated = await Light.findByIdAndUpdate(
          id,
          { 
            status: cmd === "ON",
            lastUpdated: new Date()
          },
          { new: true }
        );

        console.log("DB updated:", {
          name: updated?.name,
          status: updated?.status
        });

      } catch (dbErr) {
        console.error("Lỗi cập nhật DB:", dbErr);
      }
    });
  }, delay);

  res.json({
    success: true,
    message: `Đã đặt lịch ${status === "on" ? "BẬT" : "TẮT"} sau ${delay / 1000} giây`
  });
};

exports.getAllLights = async (req, res) => {
  try {
    const lights = await Light.find();
    res.json({
      success: true,
      data: lights
    });
  } catch (err) {
    console.error("Lỗi getAllLight:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getSystemChat = (req, res) => {
  const msg = IoTState.chatMessage;

  IoTState.chatMessage = null;

  res.json(msg);
};

exports.confirmChat = (req, res) => {
  const { confirm } = req.body;
  IoTState.confirm = confirm;

  console.log("User confirm:", confirm);

  res.json({ success: true });
};
