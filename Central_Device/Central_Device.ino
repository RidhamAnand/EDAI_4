#include <WiFi.h>
#include <HTTPClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEClient.h>
#include "time.h"

#define WIFI_SSID "a"              // Replace with your WiFi SSID
#define WIFI_PASSWORD "12344321"   // Replace with your WiFi password
#define SERVER_URL "http://192.168.109.24:5000/api/data"  // Replace with your server's IP address and endpoint

#define SERVICE_UUID "df67ff1a-718f-11e7-8cf7-a6006ad3dba0"
#define CHARACTERISTIC_UUID "01000000-0000-0000-0000-000000efcdab"

String connectedDeviceID = "";  // Global variable to store the connected device ID


const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 19800; // Adjust for your timezone (19800 for IST)
const int daylightOffset_sec = 0; 

int lastRssiValue = 0;
BLEScan* pBLEScan;
BLEClient* pClient;

bool isConnected = false;
unsigned long connectionStartTime = 0;
unsigned long rssiCheckInterval = 5000;
unsigned long lastRssiCheckTime = 0;
const int rssiThreshold = -70;

// Define arrays to store RSSI values and connection durations
const int maxEntries = 500;
int rssiValues[maxEntries];
unsigned long connectionDurations[maxEntries];
int currentIndex = 0;
float distanceValues[maxEntries];  // Array to store estimated distances

void connectToWiFi() {
    Serial.print("Connecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi.");

    // Initialize NTP
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    Serial.println("NTP Time Sync Done.");
}

String getFormattedTime(unsigned long epochTime) {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo)) {
        Serial.println("Failed to obtain time");
        return "1970-01-01 00:00:00";  // Default value if NTP fails
    }

    char buffer[20];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", &timeinfo);
    return String(buffer);
}

void postData() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(SERVER_URL);
        http.addHeader("Content-Type", "application/json");

        time_t outTime = time(nullptr);

        float totalDistance = 0;
        for (int i = 0; i < currentIndex; i++) {
            totalDistance += distanceValues[i];
        }
        float avgDistance = (currentIndex > 0) ? (totalDistance / currentIndex) : 0;

        Serial.println("------- Data to be Sent -------");
        Serial.print("Device ID: ");
        Serial.println(connectedDeviceID);
        Serial.print("In Time: ");
        Serial.println(connectionStartTime);
        Serial.print("Out Time: ");
        Serial.println(outTime);
        Serial.print("Average Distance: ");
        Serial.println(avgDistance);
        Serial.println("-------------------------------");

        String jsonPayload = "{ \"device_id\": \"" + connectedDeviceID + "\", \"rssi_values\": [";
        for (int i = 0; i < currentIndex; i++) {
            jsonPayload += String(rssiValues[i]);
            if (i < currentIndex - 1) jsonPayload += ", ";
        }
        jsonPayload += "], \"last_retention\": " + String(connectionDurations[currentIndex - 10]) +
                       ", \"in_time\": " + String(connectionStartTime) +
                       ", \"out_time\": " + String(outTime) +
                       ", \"average_distance\": " + String(avgDistance) + " }";

        int httpResponseCode = http.POST(jsonPayload);

        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.print("Server response: ");
            Serial.println(response);
        } else {
            Serial.print("Error in HTTP request: ");
            Serial.println(http.errorToString(httpResponseCode).c_str());
        }

        http.end();
    } else {
        Serial.println("WiFi not connected. Cannot send data.");
    }
}

void setup() {
    Serial.begin(115200);
    connectToWiFi();

    BLEDevice::init("ESP32 Central Device");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setActiveScan(true);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);
    startScanning();
}

void startScanning() {
    Serial.println("Starting BLE Scan...");
    pBLEScan->start(5, false);
}
void  connectToServer(BLEAddress address) {
    Serial.print("Attempting to connect to device: ");
    Serial.println(address.toString().c_str());

    pClient = BLEDevice::createClient();
    if (!pClient->connect(address)) {
        Serial.println("Failed to connect to device.");
        return;
    }
    Serial.println("Connected to device.");

    isConnected = true;
    
    // Store Device ID
    connectedDeviceID = address.toString().c_str();

    // Use actual timestamp instead of millis()
    connectionStartTime = time(nullptr);  // Store actual epoch time

    Serial.print("Device ID: ");
    Serial.println(connectedDeviceID);

    Serial.print("In Time: ");
    Serial.println(getFormattedTime(connectionStartTime));

    currentIndex = 0; // Reset the current index when connected
}

void checkRSSI() {
    if (isConnected && millis() - lastRssiCheckTime >= rssiCheckInterval) {
        lastRssiCheckTime = millis();
        lastRssiValue = pClient->getRssi();
        Serial.print("Current RSSI Value: ");
        Serial.println(lastRssiValue);

        // Adjusted calibration values for 20cm distance
        float d0 = 0.2;   // Reference distance (meters) - 20cm
        int Pr0 = -50;    // RSSI at 20cm (calibrated value)
        float n = 2.7;    // Path loss exponent (adjust if needed)

        // Calculate estimated distance
        float estimatedDistance = d0 * pow(10, (Pr0 - lastRssiValue) / (10 * n));

        Serial.print("Estimated Distance: ");
        Serial.print(estimatedDistance);
        Serial.println(" meters");

        // Store values in arrays
        if (currentIndex < maxEntries) {
            rssiValues[currentIndex] = lastRssiValue;
            distanceValues[currentIndex] = estimatedDistance;
            currentIndex++;
        }

        if (lastRssiValue < rssiThreshold) {
            Serial.println("Device is out of range. Disconnecting...");
            pClient->disconnect();
            isConnected = false;

            postData(); // Post data to server after disconnection
            startScanning();
        }
    }
}

void loop() {
    if (isConnected) {
        if (!pClient->isConnected()) {
            Serial.println("Disconnected from device.");
            isConnected = false;
            postData(); // Post data when disconnected
            startScanning();
        } else {
            checkRSSI();
            return;
        }
    } else {
        startScanning();
        delay(1000);

        BLEScanResults* foundDevices = pBLEScan->getResults();
        for (int i = 0; i < foundDevices->getCount(); i++) {
            BLEAdvertisedDevice device = foundDevices->getDevice(i);
            if (device.haveServiceUUID() && device.getServiceUUID().toString() == SERVICE_UUID) {
                connectToServer(device.getAddress());
                break;
            }
        }
    }
}
