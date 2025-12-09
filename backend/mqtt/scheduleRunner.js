const Schedule = require("../models/schedule");
const Light = require("../models/light");

module.exports = (mqttClient) => {
  setInterval(async () => {
    const now = new Date();
    const currentHHMM = now.toTimeString().slice(0, 5);

    const schedules = await Schedule.find({
      enabled: true,
      time: currentHHMM
    });

    for (let sch of schedules) {
      const topic = `home/${sch.lightId}`;
      const cmd = sch.action;

      console.log("⏰ ĐANG THỰC HIỆN LỊCH:", currentHHMM, sch);

      // Gửi lệnh MQTT
      mqttClient.publish(topic, cmd, { qos: 1 });

      // Cập nhật trạng thái đèn
      await Light.findByIdAndUpdate(sch.lightId, {
        status: cmd === "ON",
        lastUpdated: new Date()
      });

      // Vô hiệu hóa lịch sau khi chạy
      sch.enabled = false;
      await sch.save();
    }
  }, 1000);
};
