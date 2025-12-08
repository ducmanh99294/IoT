const Light = require('../models/light');

const TOPIC_CMD = "home/light1";

exports.sendCommand = async (req, res) => {
  const { command } = req.body;
  const mqttClient = req.app.get("mqttClient");

  if (!mqttClient.connected) {
    return res.status(500).json({ message: "MQTT not connected" });
  }

  try {
    // Gửi lệnh qua MQTT
    mqttClient.publish(process.env.MQTT_TOPIC_COMMAND || TOPIC_CMD, command);
    console.log(`📤 Sent command: ${command}`);

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
  const { command } = req.body;     
  const normalizedCommand = command?.toUpperCase();

  if (!["ON", "OFF"].includes(normalizedCommand)) {
    return res.status(400).json({ error: "Command phải là 'ON' hoặc 'OFF'" });
  }

  const mqttClient = req.app.get("mqttClient");
  if (!mqttClient || !mqttClient.connected) {
    return res.status(500).json({ message: "MQTT not connected" });
  }

  try {
    const topic = `home/${id}`;
    mqttClient.publish(topic, normalizedCommand);
    console.log(`💡 Gửi lệnh: ${normalizedCommand} ➜ topic: ${topic}`);

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
  const { status, time } = req.body;

  const mqttClient = req.app.get("mqttClient");
  if (!mqttClient.connected) {
    return res.status(500).json({ message: "MQTT not connected" });
  }

  const [hour, minute] = time.split(":").map(Number);
  const now = new Date();
  let targetTime = new Date();
  targetTime.setHours(hour, minute, 0, 0);

  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  const delay = targetTime - now;
  const cmd = status ? "ON" : "OFF";

  setTimeout(async () => {  
    try {
      const topic = `home/${id}`;
      await new Promise((resolve, reject) => {
        mqttClient.publish(topic, cmd, { qos: 1 }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('❌ Scheduled task error:', error);
    }
  }, delay);

  res.json({
    success: true,
    message: `Đã đặt lịch ${status ? "BẬT" : "TẮT"} đèn lúc ${time}`
  });
};

exports.test = (req, res) => {
  res.send("Smart Light Controller đang hoạt động ⚙️");
};

exports.getAllLights = async (req, res) => {
  try {
    const lights = await Light.find(); // lấy tất cả đèn
    res.json({
      success: true,
      data: lights
    });
  } catch (err) {
    console.error("Lỗi getAllLight:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

