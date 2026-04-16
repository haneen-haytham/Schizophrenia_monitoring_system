#include <WiFi.h>
#include <WebServer.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

const char* ssid = "Haneen";
const char* password = "12345678";

Adafruit_MPU6050 mpu;
WebServer server(80); // سيرفر على بورت 80

void handleRoot() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // صفحة HTML بسيطة بتعرض القراءات
  String html = "<html><body>";
  html += "<h1>ESP32 MPU6050 Readings</h1>";
  html += "<p>Accel X: " + String(a.acceleration.x) + " m/s^2</p>";
  html += "<p>Accel Y: " + String(a.acceleration.y) + " m/s^2</p>";
  html += "<p>Accel Z: " + String(a.acceleration.z) + " m/s^2</p>";
  html += "<script>setTimeout(function(){location.reload();}, 500);</script>"; // تحديث كل نص ثانية
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  
  Serial.println("\nWiFi Connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP()); // خدي العنوان ده كوبي

  if (!mpu.begin()) { while (1) yield(); }

  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient(); // معالجة طلبات المتصفح
}