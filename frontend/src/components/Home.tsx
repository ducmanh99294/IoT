import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/home.css';
import mqttClient from "../services/mqtt";

const api = import.meta.env.VITE_api || "http://localhost:3000";

const Home = ({
  lights,
  setLights,
  fetchLights,
  schedule,
  fetchSchedule,
}: any) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const userId = "123";

  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    deviceId: "",
    time: "",
    action: "ON",
  });

  /* ===================== MQTT ===================== */
  useEffect(() => {
    if (!mqttClient.connected) mqttClient.connect();

    const topic = `iot/status/${userId}/+`;
    mqttClient.subscribe(topic);

    const onMessage = (topic: string, message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        const deviceId = topic.split("/").pop();

        setLights((prev: any[]) =>
          prev.map((l) =>
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

  /* ===================== AUTH ===================== */
  useEffect(() => {
    if(!token) {
      alert("hãy đăng nhập")
      navigate("/login")
    }
  },[token])

  /* ===================== TOGGLE DEVICE ===================== */
  const toggleDevice = (light: any) => {
    const newStatus = light.status ? "off" : "on";

    mqttClient.publish(
      `iot/command/${userId}/${light._id}`,
      JSON.stringify({
        status: newStatus,
      })
    );

    console.log("📤 Sent:", newStatus);
    console.log("📤 Sent at:", `iot/command/${userId}/${light._id}`);
  }
/* ===================== SCHEDULE ===================== */
  const handleAddSchedule = async () => {
    try {
      const res = await fetch(`${api}/api/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSchedule),
      });

      if (!res.ok) throw new Error("Failed");
      fetchSchedule();
      setShowAddSchedule(false);
    } catch (err) {
      alert("Không thể thêm lịch");
    }
  };

  const toggleSchedule = async (s: any) => {
    await fetch(`${api}/api/schedule/${s._id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSchedule();
  };

  const deleteSchedule = async (s: any) => {
    await fetch(`${api}/api/schedule/${s._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSchedule();
  };

  // Tính toán thống kê
  const stats = {
    total: lights.length,
    active: lights.filter((l: any) => l.status).length,
    schedules: schedule.filter((s: any) => s.enabled).length,
  };

  const lightIsOn = (lights: any[]) => {
    return lights && lights.filter(light => light.status === true).length;
  }
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1>🏠 Quản Lý Nhà Thông Minh</h1>
        <p>Điều khiển và giám sát ngôi nhà của bạn từ xa</p>
      </header>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Thiết bị */}
        <div className="card">
          <div className="card-header">
            <h2>🎛️ Thiết Bị</h2>
            <span className="device-count">
              {lightIsOn(lights)}/{lights.length} đang bật
            </span>
          </div>
          
          <div className="device-grid">
            {lights.map((device: any) => (
              <div key={device._id} className="device-card">
                <div className="device-info">
                  <div className="device-details">
                    <div className="device-name">{device.name}</div>
                  </div>
                </div>
                
                <div className="device-controls">
                  <div className="device-status">
                    {device.status ? (
                      <span style={{ color: 'var(--accent-on)' }}>● Đang bật</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>○ Đang tắt</span>
                    )}
                  </div>
                  
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={device.status}
                      onChange={() => toggleDevice(device)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lịch hẹn giờ */}
        <div className="card">
          <div className="card-header">
            <h2>⏰ Hẹn Giờ</h2>
            <button 
              className="btn btn-primary btn-small"
              onClick={() => setShowAddSchedule(!showAddSchedule)}
            >
              {showAddSchedule ? 'Hủy' : '+ Thêm lịch'}
            </button>
          </div>

          {showAddSchedule && (
            <div className="add-schedule-form">
              <h3>Thêm Lịch Mới</h3>
              <div className="form-group">
                <label>Thiết bị</label>
                <select 
                  value={newSchedule.deviceId}
                  onChange={(e) => setNewSchedule({...newSchedule, deviceId: e.target.value})}
                >
                  <option value="">Chọn thiết bị</option>
                  {lights.map((light: any) => (
                    <option key={light._id} value={light._id}>
                      {light.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Thời gian</label>
                <input 
                  type="time" 
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Hành động</label>
                <select 
                  value={newSchedule.action}
                  onChange={(e) => setNewSchedule({...newSchedule, action: e.target.value})}
                >
                  <option value="ON">Bật</option>
                  <option value="OFF">Tắt</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => setShowAddSchedule(false)}>
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={handleAddSchedule}>
                  Thêm Lịch
                </button>
              </div>
            </div>
          )}

          <div className="schedule-list">
            {schedule.map((schedule: any) => (
              <div key={schedule.id} className="schedule-item">
                <div className="schedule-info">
                  <div className="schedule-device">{schedule.lightId.name}</div>
                  <div className="schedule-time">
                    {schedule.action} lúc {schedule.time}
                  </div>
                  <div className="schedule-status">
                    {schedule.enabled ? (
                      <span style={{ color: 'var(--success)' }}>● Đang hoạt động</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>○ Đã tắt</span>
                    )}
                  </div>
                </div>
                
                <div className="schedule-actions">
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => toggleSchedule(schedule)}
                  >
                    {schedule.enabled ? 'Tắt' : 'Bật'}
                  </button>
                  <button 
                    className="btn btn-small"
                    onClick={() => deleteSchedule(schedule)}
                    style={{ backgroundColor: 'var(--alert)', color: 'white' }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thống kê */}
        <div className="card">
          <div className="card-header">
            <h2>📊 Thống Kê</h2>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🔌</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Thiết bị</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Đang hoạt động</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-value">{stats.schedules}</div>
              <div className="stat-label">Lịch hẹn</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;