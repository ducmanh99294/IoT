const express = require("express");
const cors = require("cors");
const connectDB = require('./config/config');
const app = express();
app.use(cors());
app.use(express.json());

// const {  IoTState } = require("./mqtt/mqttClient");

// app.set("mqttClient", mqttClient);
// app.set("IoTState", IoTState);

// mqtt
const mqttClient = require("./mqtt/mqttClient");
const mqttListener = require("./mqtt/mqttListener");

mqttListener(mqttClient);

app.set("mqttClient", mqttClient);
//-----------------------------------
connectDB();
// Import routes
const homeRoutes = require("./routes/homeRoutes");
const userRoutes = require('./routes/userRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

app.use('/api/users', userRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use("/api", homeRoutes);

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Default route
app.get("/", (req, res) => {
  res.send("Smart Light Backend đang chạy!");
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
