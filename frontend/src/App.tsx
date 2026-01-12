import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from "./components/header";
import Footer from "./components/Footer";
import Account from "./components/Account";
import Chatbox from "./components/Chatbox";
import "./assets/home.css";
import { useEffect, useState } from "react";
import mqttClient from "./services/mqtt";

const MainLayout = ({ lights, schedule, fetchSchedule, fetchLights }: any) => {
  const location = useLocation();

  const hideLayout = ["/login", "/register"];
  const shouldHide = hideLayout.includes(location.pathname);

  return (
    <>
      {!shouldHide && <Header />}
      <Routes>
        <Route path="/" element={<Home lights={lights} schedule={schedule} fetchSchedule={fetchSchedule} fetchLights={fetchLights} />} />
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      {!shouldHide && <Footer />}
      {!shouldHide && <Chatbox lights={lights} schedule={schedule} fetchSchedule={fetchSchedule}  fetchLights={fetchLights} />}
    </>
  );
};

const App = () => {
  const [lights, setLights] = useState<any[]>([]);
  const [schedule, setSchedule] = useState([]);
  // const api = "https://iot-1-4t8m.onrender.com"
  const api = "http://localhost:3000";
// 
  const fetchLights = async () => {
    const res = await fetch(`${api}/api/lights`);
    const data = await res.json();
    setLights(data.data);
  };

  // const fetchSchedule = async () => {
  //   const res = await fetch(`${api}/api/schedule`);
  //   const data = await res.json();
  //   setSchedule(data.data);
  // };
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLights();
      // fetchSchedule(); 
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!mqttClient.connected) mqttClient.connect();

    const topic = `iot/status/123/light-1`;
    mqttClient.subscribe(topic);

    const onMessage = (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        const deviceId = topic.split("/").pop();

        setLights(prev =>
          prev.map(l =>
            l._id === deviceId
              ? { ...l, status: data.status === "on" }
              : l
          )
        );
      } catch (err) {
        console.error("MQTT parse error", err);
      }
    };

    mqttClient.on("message", onMessage);

    return () => {
      mqttClient.off("message", onMessage);
      mqttClient.unsubscribe(topic);
    };
  }, []);
  return (
    <Router>
      <MainLayout 
      lights={lights} 
      schedule={schedule} 
      // fetchSchedule={fetchSchedule}  
      fetchLights={fetchLights} />
    </Router>
  );
};

export default App;
