const express = require("express");
const cors = require("cors");
const connectDB = require('./config/config');
const app = express();
app.use(cors());
app.use(express.json());

const mqttClient = require("./mqtt/mqttClient"); 
app.set("mqttClient", mqttClient);

connectDB();
// Import routes
const lightDeviceRoutes = require("./routes/deviceRoutes");
const lightRoutes = require("./routes/lightRoutes")
app.use("/api", lightDeviceRoutes);
app.use("/api", lightRoutes);
// Default route
app.get("/", (req, res) => {
  res.send("🚀 Smart Light Backend đang chạy!");
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));
