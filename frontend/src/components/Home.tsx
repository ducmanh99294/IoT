import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/home.css';

const Home: React.FC<any> = ({ lights, fetchLights, schedule, fetchSchedule }: any) => {
  const navigate = useNavigate();

  const [newSchedule, setNewSchedule] = useState({
    deviceId: '',
    time: '',
    action: 'bật'
  });
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const token = localStorage.getItem("token")
  // const api = "http://localhost:3000"
  const api = "https://iot-1-4t8m.onrender.com"
  
  useEffect(() => {
    if(!token) {
      alert("hãy đăng nhập")
      navigate("/login")
    }
  },[token])
  // Hàm bật/tắt thiết bị
  const toggleDevice = async (light: any) => {
      const ValueStatus = !light.status ? "on" : "off"
    console.log(JSON.stringify({ status: ValueStatus, name: light.name }))
    try {
      const ValueStatus = !light.status ? "on" : "off"
      const res = await fetch(`${api}/api/lights/${light._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: ValueStatus, name: light.name })
      });

      if (!res.ok) throw new Error("Failed");
      await fetchLights();

    } catch (err) {
      return `❌ Không thể kết nối server!, ${err}`;
    }
  };

  // Hàm xóa lịch
  const deleteSchedule = async (light: any) => {
    try {
      const res = await fetch(`${api}/api/schedule/${light._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed");
      await fetchSchedule();

    } catch (err) {
      return `Không thể kết nối server!, ${err}`;
    }
  };

  // Hàm bật/tắt lịch
  const toggleSchedule = async (light: any) => {
    try {
      const res = await fetch(`${api}/api/schedule/${light._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed");
      await fetchSchedule();

    } catch (err) {
      return `Không thể kết nối server!, ${err}`;
    }
  };

  // Hàm thêm lịch mới
  const handleAddSchedule = async () => {
    try {
      const res = await fetch(`${api}/api/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lightId: newSchedule.deviceId,
          time: newSchedule.time,
          action: newSchedule.action
        })
      });

      if (!res.ok) throw new Error("Failed");
      await fetchSchedule();
      setShowAddSchedule(false);
    } catch (err) {
      return `Không thể kết nối server!, ${err}`;
    }
  };

  // Tính toán thống kê
  const stats = {
    totalDevices: lights.length,
    activeDevices: lights.filter((d: any) => d.status === true).length,
    activeSchedules: schedule.filter((s: any) => s.enabled  === true).length,
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
              <div className="stat-value">{stats.totalDevices}</div>
              <div className="stat-label">Thiết bị</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-value">{stats.activeDevices}</div>
              <div className="stat-label">Đang hoạt động</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-value">{stats.activeSchedules}</div>
              <div className="stat-label">Lịch hẹn</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;