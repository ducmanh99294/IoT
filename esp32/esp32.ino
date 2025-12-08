#include <WiFi.h>

const char* ssid = "Binh Quan Manh";     // Tên WiFi
const char* password = "123456789";      // Mật khẩu WiFi

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Đang kết nối WiFi...");
  WiFi.begin(ssid, password);

  // Chờ kết nối
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("Kết nối thành công!");
  Serial.print("Địa chỉ IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Không cần gì trong loop
}
