import React, { useState, useEffect, useRef } from 'react';
import '../assets/chatbox.css';

const Chatbox: React.FC<any> = ({ lights, fetchLights }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  const api = "http://localhost:3000"
  // Quick actions
  const quickActions: any[] = [
    { id: 1, text: 'Bật đèn phòng khách', command: 'Bật đèn phòng khách', icon: '💡' },
    { id: 2, text: 'Tất cả đèn', command: 'Tắt tất cả đèn', icon: '🔌' },
    { id: 3, text: 'Hẹn giờ đèn', command: 'Hẹn giờ đèn phòng ngủ 22:00', icon: '⏰' },
    { id: 4, text: 'Trạng thái nhà', command: 'Trạng thái các thiết bị', icon: '📊' },
    { id: 5, text: 'Mở camera', command: 'Mở camera cửa trước', icon: '📹' },
    { id: 6, text: 'Cảnh báo', command: 'Có cảnh báo gì không?', icon: '🚨' },
  ];

  // Initial welcome message
  useEffect(() => {
    if (isInitialMount.current) {
      const welcomeMessages: any[] = [
        {
          id: 1,
          text: '👋 Chào mừng bạn trở lại!',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'welcome'
        },
        {
          id: 2,
          text: 'Tôi là trợ lý AI của Smart Home. Tôi có thể giúp bạn điều khiển thiết bị, kiểm tra trạng thái và nhận cảnh báo.',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'welcome'
        },
        {
          id: 3,
          text: 'Bạn muốn làm gì hôm nay?',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'welcome'
        }
      ];
      
      // Check time for personalized greeting
      const hour = new Date().getHours();
      let timeGreeting = '';
      if (hour < 12) timeGreeting = 'Buổi sáng tốt lành!';
      else if (hour < 18) timeGreeting = 'Buổi chiều vui vẻ!';
      else timeGreeting = 'Buổi tối an lành!';
      
      welcomeMessages[0].text = `👋 ${timeGreeting} Chào mừng bạn trở lại!`;
      
      setMessages(welcomeMessages);
      setHasUnread(true);
      isInitialMount.current = false;
    }
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle window drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!chatboxRef.current) return;
    
    const rect = chatboxRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !chatboxRef.current) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Calculate boundaries
    const maxX = window.innerWidth - chatboxRef.current.offsetWidth;
    const maxY = window.innerHeight - chatboxRef.current.offsetHeight;
    
    // Apply boundaries
    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleOpenChatBox = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      setHasUnread(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const toggleLight = async (id: string, status: any, name: any) => {
    try {
      const res = await fetch(`${api}/api/lights/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("Failed");

      await fetchLights();

      return `Đã ${status.toLowerCase() === "on" ? "bật" : "tắt"} đèn ${name}!`;
    } catch (err) {
      return `Không thể kết nối server!, ${err}`;
    }
  };

  const scheduleLight = async (target :any, action:any, time :any) => {
    try {
      const res = await fetch(`http://localhost:3000/api/lights/schedule/${target._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        action: action,
        time: time
      })
    });

      if (!res.ok) {
        console.log("err");
        return " Lỗi khi đặt lịch!";
      }
      await fetchLights();

      return `⏰ Đã đặt lịch ${action === "on" ? "bật" : "tắt"} đèn ${target.name} vào ${time.toLocaleString()}`;
      
    } catch (err) {
      console.log(err);
      return " Có lỗi xảy ra!";
    }
  }

  const scheduleDelayLight = async (target: any, status: any, delay: any) => {
    console.log(JSON.stringify({ status, delay }))
    try {
      const res = await fetch(`${api}/api/lights/schedule-delay/${target._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, delay })
      });

      if (!res.ok) {
        return "Lỗi khi đặt hẹn giờ!";
      }
      await fetchLights();

      return `Đã đặt hẹn ${status === "on" ? "bật" : "tắt"} ${target.name} sau ${delay / 1000} giây`;
    } catch (err) {
      console.log(err);
      return "Có lỗi xảy ra!";
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage: any = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate AI response after delay
    setTimeout(() => {
      handleAIResponse(inputText);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleAIResponse = async (userInput: string) => {
    const input = userInput.toLowerCase();
    let response = '';

    // Hẹn giờ bật/tắt đèn
    if (input.includes("hẹn giờ") || input.includes("lúc") || input.includes("sau")) {
      const target = lights.find((l: any) =>
        input.includes(l.name.toLowerCase().replace("đèn ", "").trim())
      );

      if (!target) {
        response = "Bạn muốn hẹn giờ cho đèn nào?";
      } else {
        let action = "";

        if (input.includes("bật")) action = "on";
        else if (input.includes("tắt")) action = "off";
        else action = "off";

        // hẹn giờ sau
        const matchDelay = input.match(/sau\s+(\d+)\s*(s|giây|p|phút|phut|h|giờ|gio)/);

        if (matchDelay) {
          const amount = parseInt(matchDelay[1]);
          const unit = matchDelay[2];
          let delay = 0;

          if (unit.includes("giây") || unit.includes("s")) delay = amount * 1000;
          else if (unit.includes("phút") || unit.includes("phut") || unit.includes("p") ) delay = amount * 60 * 1000;
          else if (unit.includes("giờ") || unit.includes("gio") || unit.includes("h") ) delay = amount * 60 * 60 * 1000;

          response = await scheduleDelayLight(target, action, delay);
        }

        // hẹn giờ tắt lúc
        else if (input.includes("lúc")) {
          const match = input.match(/\b\d{1,2}:\d{2}\b/);
          if (match) {
            const [h, m] = match[0].split(":");
            const d = new Date();
            d.setHours(Number(h), Number(m), 0, 0);
            response = await scheduleLight(target, action, d);
          } else {
            response = "⚠️ Bạn nói 'lúc' nhưng không có thời gian hợp lệ!";
          }
        }

        else {
          response = "⏰ Bạn muốn hẹn giờ như thế nào? ví dụ:\n- 'tắt đèn nhà bếp sau 5 phút'\n- 'bật đèn phòng ngủ lúc 20:30'";
        }
      }
    }

    // tắt tất cả
    else if (input.includes("tắt tất cả")) {
      for (const light of lights) {
        await toggleLight(light._id, "off", lights.name);
      }
      response = "🔌 Đã tắt toàn bộ đèn trong nhà!";
    }

    //  Bật đèn
    else if (input.includes("bật") || input.includes("thắp sáng")) {
      const target = lights.find((l:any) =>
        input.includes(l.name.toLowerCase().replace("đèn ", "").trim())
      );

      if (target) {
        response = await toggleLight(target._id, "on", target.name);
      } else {
        response = "Bạn muốn bật đèn nào? (phòng khách, phòng ngủ, bếp...)";
      }
    }

    //  Tắt đèn
    else if (input.includes("tắt")) {
      const target = lights.find((l:any) =>
        input.includes(l.name.toLowerCase().replace("đèn ", "").trim())
      );

      if (target) {
        response = await toggleLight(target._id, "off", target.name);
      } else {
        response = "Bạn muốn tắt đèn nào?";
      }
    }

    else if (input.includes("đèn") || input.includes("còn") || input.includes("đang")) {

      // Kiểm tra người dùng nói cả bật và tắt ⇒ mơ hồ
      const isOnQuery =
        input.includes("bật") || input.includes("sáng") || input.includes("mở");

      const isOffQuery =
        input.includes("tắt") || input.includes("off") || input.includes("đóng");

      // Trường hợp mơ hồ: bật + tắt cùng lúc
      if (isOnQuery && isOffQuery) {
        return "Bạn muốn kiểm tra đèn đang bật hay đang tắt? Vui lòng nói rõ hơn.";
      }

      // Không chứa bật hoặc tắt ⇒ không rõ người dùng muốn hỏi gì
      if (!isOnQuery && !isOffQuery) {
        return "Bạn muốn kiểm tra đèn đang bật hay đang tắt?";
      }

      // Bắt đầu lọc theo trạng thái đèn
      let filtered: any[] = [];

      if (isOnQuery) {
        filtered = lights.filter((light: any) => light.status === true);
      } else if (isOffQuery) {
        filtered = lights.filter((light: any) => light.status === false);
      }

      // Không có đèn phù hợp
      if (filtered.length === 0) {
        return isOnQuery
          ? "Không có đèn nào đang bật."
          : "Không có đèn nào đang tắt.";
      }

      // Có đèn phù hợp → liệt kê tên
      const names = filtered.map((l: any) => l.name).join(", ");
      return isOnQuery
        ? `Đèn đang bật: ${names}`
        : `Đèn đang tắt: ${names}`;
    }

    //  Lấy trạng thái đèn
    else if (input.includes("trạng thái") || input.includes("đèn")) {
      response = "Trạng thái hệ thống:\n" +
        lights.map((l:any) => `• ${l.name}: ${l.status ? "Bật 🔆" : "Tắt 🌑"}`).join("\n");
    }

    else {
      response = `Tôi hiểu bạn nói: "${userInput}". Tôi đang học thêm để hỗ trợ bạn nhiều hơn!`;
    }

    // Trả tin nhắn AI
    const aiMessage: any = {
      id: Date.now() + 1,
      text: response,
      sender: 'assistant',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleQuickAction = (action: any) => {
    // Add user message from quick action
    const userMessage: any = {
      id: Date.now(),
      text: action.command,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      handleAIResponse(action.command);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: 'Cuộc trò chuyện đã được làm mới. Tôi có thể giúp gì cho bạn?',
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const windowStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`
  };

  return (
    <div className="chatbox-container">
      {/* Chatbox Toggle Button */}
      <button 
        className="chatbox-toggle"
        onClick={handleOpenChatBox}
        aria-label={isOpen ? "Đóng chatbox" : "Mở chatbox"}
      >
        {isOpen ? '✕' : '🤖'}
        {hasUnread && !isOpen && <span className="unread-badge">!</span>}
      </button>

      {/* Chatbox Window */}
      <div 
        ref={chatboxRef}
        className={`chatbox-window ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
        style={windowStyle}
      >
        {/* Header */}
        <div 
          className="chatbox-header"
          onMouseDown={handleMouseDown}
        >
          <div className="chatbox-title">
            <span>🤖</span>
            <div>
              <div>Trợ lý AI</div>
              <div className="chatbox-status">Đang trực tuyến</div>
            </div>
          </div>
          
          <div className="header-controls">
            <button 
              className="header-btn"
              onClick={clearChat}
              title="Làm mới"
            >
              🔄
            </button>
            <button 
              className="header-btn"
              onClick={() => setIsOpen(false)}
              title="Thu nhỏ"
            >
              ➖
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chatbox-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message message-${message.sender}`}
            >
              <div>{message.text.split('\n').map((line: any, i: any) => (
                <React.Fragment key={i}>
                  {line}
                  {i < message.text.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          {quickActions.slice(0,2).map((action) => (
            <button
              key={action.id}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action)}
            >
              {action.icon} {action.text}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="chatbox-input-container">
          <input
            ref={inputRef}
            type="text"
            className="chatbox-input"
            placeholder="Nhập lệnh hoặc câu hỏi..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          
          <div className="input-controls">
            <button 
              className="input-btn"
              onClick={handleSendMessage}
              disabled={isTyping || !inputText.trim()}
              title="Gửi tin nhắn"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;