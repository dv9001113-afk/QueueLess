# 🏥 QueueLess — Hospital OPD Smart Queue & Real-Time Dispatch System

<div align="center">

### 🌟 **"Aapki Bari, Bina Kisi Hospital Line Ke"**
*Apex City Care Super-Specialty Hospital ke liye taiyar kiya gaya Complete Real-Time Queue, Doctor Virtual Payment, Exact GPS Location & Dynamic Travel Radar System.*

<br/>

**🩺 Head Doctor Console • 👨‍💼 Floor Staff Calling Desk • 📱 Dedicated Patient OPD Portal • 🛠️ Admin Console**

<br/>

[🩺 1. Head Doctor Console](http://localhost:5000/doctor-portal.html) &nbsp;•&nbsp;
[👨‍💼 2. Floor Staff Calling Desk](http://localhost:5000/staff-dashboard.html) &nbsp;•&nbsp;
[📱 3. Patient OPD Portal](http://localhost:5000/patient-portal.html) &nbsp;•&nbsp;
[📝 4. Patient Registration & Pass](http://localhost:5000/registration.html) &nbsp;•&nbsp;
[🔑 5. Unified Sign In Hub](http://localhost:5000/login.html) &nbsp;•&nbsp;
[🛠️ 6. Dev Database Admin](http://localhost:5000/dev-database-admin.html)

</div>

---

## 🚀 Key Features Overview

### 1. 🩺 Doctor Clinical Console & Virtual Monetization System
* **Real-time Consultation Management**: Standard 10-Minute Consultation Protocol timer, +5 Min time extension offset, emergency broadcast postponement (+12 mins), priority triage, and digital Rx maker.
* **Virtual Payment Suite (Settlement to Platform Owner)**:
  * **Free Standard Tier**: Baseline 10-patient roster cap.
  * **Pro Clinical Suite (₹1,499/mo)**: Unlimited roster, GPS transit radar, priority audio triage, digital Rx prescription maker.
  * **Enterprise Platinum AI Suite (₹3,999/mo)**: AI Diagnostic Copilot, Live WhatsApp/SMS alerts, Tele-OPD bridge, and VIP doctor badge.
  * **Single Feature Add-ons**: AI Diagnostic Copilot (₹499), Patient WhatsApp Alerts (₹399), GPS Transit Radar (₹399), Digital Rx Maker (₹299).
  * **Platform Owner Virtual Settlement**: Direct routing to Platform Owner account (`OWNER-QL-ADMIN-99`, UPI: `queueless.owner@hdfcbank`).
  * **Official Tax Invoice / Receipt**: Instant GST invoice generation with transaction ID, itemized fee breakdown, print support, and 100% ad-suppression guarantee.

### 2. 📱 Patient Portal, Instant Booking & Exact Location Radar
* **In-Page Patient Creation & Booking (`#mBookAppt`)**:
  * Direct appointment creation with real doctor free slots.
  * Auto-generates unique OPD Token (e.g. `MED-101`, `GEN-102`, `ORT-103`).
* **Exact Location & GPS Navigation Radar (`#mLocationRadar`)**:
  * **Exact Destination Coordinates**: Apex City Care Hospital (`28.5672° N, 77.2100° E`, Health Boulevard, Ring Road, Sector 12, Opposite Metro Pillar 142).
  * **10 Real Delhi-NCR Starting Landmarks**:
    1. AIIMS Campus Gate 2 (`28.5672° N, 77.2100° E` • 1.2 km)
    2. Connaught Place Inner Circle, Block B (`28.6315° N, 77.2167° E` • 2.8 km)
    3. South Extension Part 1 Market (`28.5729° N, 77.2228° E` • 3.4 km)
    4. Defence Colony Flyover / Ring Road (`28.5733° N, 77.2346° E` • 3.7 km)
    5. Lajpat Nagar Central Market (`28.5684° N, 77.2435° E` • 4.1 km)
    6. Karol Bagh Metro Station (`28.6434° N, 77.1887° E` • 5.8 km)
    7. Vasant Kunj B-Block Pocket 2 (`28.5284° N, 77.1541° E` • 6.4 km)
    8. Saket Select Citywalk Mall (`28.5285° N, 77.2185° E` • 7.2 km)
    9. Noida Sector 62 Electronic City (`28.6280° N, 77.3649° E` • 8.5 km)
    10. Cyber City DLF Phase 2, Gurugram (`28.4906° N, 77.0888° E` • 16.5 km)
  * **Dynamic Transit Duration Calculator**: Real-time travel time calculation for Walk, 2-Wheeler (Bike), Car/Cab, and Metro.
  * **Live Satellite Dispatch Radar**: Animated transit radar visual with direct Google Maps turn-by-turn navigation.

### 3. 👨‍💼 Floor Staff OPD Calling Desk & Master Roster
* **Pre-Defined 10 Hospital Doctors**:
  * Dr. Sarah Mehta (Cardiology, Room 101)
  * Dr. Rajesh Verma (Internal Medicine, Room 102)
  * Dr. Ananya Sen (Pediatrics, Room 103)
  * Dr. Vikramaditya Rathore (Orthopedics, Room 104)
  * Dr. Meera Nambiar (Dermatology, Room 105)
  * Dr. Rohan Kulkarni (ENT, Room 106)
  * Dr. Priya Swaminathan (Neurology, Room 107)
  * Dr. Amitav Ghosh (Pulmonology, Room 108)
  * Dr. Sunita Deshmukh (Gynecology, Room 109)
  * Dr. Kabir Mukherjee (Ophthalmology, Room 110)
* **Pre-Defined 10 Active Patients**: Full clinical profiles with live tokens, chief complaints, travel distances, and queue statuses.
* **Pre-Defined 15 Hospital Staff Members**: Calling desk operators across OPD Desks 1 to 10, nursing supervisors, triage coordinators, and floor managers.
* **Real-time Audio Announcements**: Text-to-speech voice broadcasts & Airport chime synthesizer.

---

## 🔑 Login Credentials

| Role | Name / Designation | Email Address | Password | Direct Portal |
| :--- | :--- | :--- | :--- | :--- |
| **🩺 Head Doctor** | Dr. Sarah Mehta, MD | `doctor@queueless.com` | `doctor123` | `doctor-portal.html` |
| **👨‍💼 Floor Staff** | Sister Priya Nair | `staff@queueless.com` | `staff123` | `staff-dashboard.html` |
| **📱 Patient / Client** | Aarav Sharma | `patient@queueless.com` | `patient123` | `patient-portal.html` |
| **🛠️ Database Admin** | Dev Architect & DBA | `admin@univ.edu` | `admin123` | `dev-database-admin.html` |

---

## 💻 How to Run

### Windows Quick Run:
Double-click `DOUBLE-CLICK-TO-RUN-ON-WINDOWS.bat` or run:
```powershell
java QueueLessServer
```
Open your browser at: `http://localhost:5000`

### Multi-Platform Packages:
* **Windows**: `QueueLess-Windows-Setup.exe` / `.bat`
* **macOS**: `launchers/mac/QueueLess.app`
* **Android**: `QueueLess.apk`
* **iOS**: `QueueLess.ipa`

---

## 🏗️ Technical Architecture
* **Frontend**: HTML5, Vanilla Modern CSS, Responsive Glassmorphism, Google Fonts (`Outfit`, `Poppins`), FontAwesome 6.
* **Real-time Synchronization**: Native `BroadcastChannel` & `localStorage` cross-tab state sharing.
* **Server**: Pure Java HTTP Server (`QueueLessServer.java`) zero-dependency runtime + Spring Boot REST backend (`backend-java/`).
* **Audio**: HTML5 Web Audio API multi-tone airport synthesizer + Web Speech API speech synthesis.

---

<div align="center">
  <sub>QueueLess Hospital OPD Dispatch System • Apex City Care Super-Specialty Hospital • 2026</sub>
</div>
