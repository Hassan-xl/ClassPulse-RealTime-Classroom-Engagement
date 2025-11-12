# 🧠 ClassPulse — Real-Time Classroom Engagement Dashboard

ClassPulse is a **local LAN-based classroom engagement tool** that enables teachers to track student participation, reactions, and live presence — all in real time, without needing an internet connection.

---

## 🚀 Overview

ClassPulse provides an interactive **Teacher Dashboard** and a **Student Web Interface** to monitor and enhance classroom engagement.  
Teachers can visualize live reactions, monitor activity, and measure participation scores instantly.

---

## ✨ Features

- 📡 **Offline LAN Mode** — Works seamlessly without internet access.
- 🎯 **Real-Time Engagement Tracking** — Displays connected students, engagement scores, and reactions.
- 💬 **Floating Reactions** — Students can send emoji-based reactions (👍 👎 ❤️ 😮 😂).
- 🧍‍♂️ **Live Presence** — See which students are currently active.
- 🔗 **QR Code Join System** — Students join easily by scanning a QR or using the LAN link.
- 🧾 **Recent Activity Feed** — Displays messages and responses from students live.

---

## 🧩 System Architecture

ClassPulse is a **Flask-based web application** designed to run on a **local network (LAN)**.

### Components:
1. **Teacher Dashboard**
   - Displays a QR code for students to join.
   - Shows live stats: connected students, engagement score, and reactions.
   - Visual panels for activity and presence tracking.

2. **Student Interface**
   - Join via QR or direct LAN link.
   - Send reactions or short feedback messages.
   - Participate anonymously for open engagement.

3. **Backend (Python + Flask)**
   - Handles socket communication between clients.
   - Updates engagement metrics in real time.
   - Manages sessions using in-memory storage.

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/ClassPulse-RealTime-Classroom-Engagement.git
cd ClassPulse-RealTime-Classroom-Engagement
2️⃣ Install Dependencies
Ensure you have Python 3.9+ installed.

bash
Copy code
pip install -r requirements.txt
3️⃣ Run the Application
bash
Copy code
python app.py
4️⃣ Connect Devices
Make sure teacher and students are on the same Wi-Fi/LAN.

The dashboard will show a QR code and local IP link (e.g., http://10.1.33.50:5000/student).

Students can scan the QR or enter the link manually to join.

🖥️ Dashboard Preview
Teacher Dashboard	Student Interface
(Add student UI screenshot here if available)

📁 Folder Structure
php
Copy code
classpulse/
│
├── app.py                # Main Flask application
├── static/               # CSS, JS, and images
├── templates/            # HTML templates
├── requirements.txt      # Python dependencies
├── README.md             # Documentation
└── class-pulse.png       # Dashboard preview image
🧠 Tech Stack
Frontend: HTML, CSS, JavaScript

Backend: Python (Flask)

Networking: Local IP (LAN communication)

QR Generation: Python qrcode library

Real-time Data: Flask-SocketIO

🧾 Example Requirements.txt
txt
Copy code
Flask==3.0.0
Flask-SocketIO==5.3.6
eventlet==0.33.3
qrcode==7.4.2
Pillow==10.0.1
(Add this file in your project root.)

🔮 Future Enhancements
✅ Save session history for analytics

✅ Add student name and ID tracking

✅ Add quizzes and polls

✅ Generate downloadable engagement reports

✅ Customize emoji and themes

👨‍💻 Contributors
Name	Role
Hassan Ali	Developer / UI Designer
Naveed Raza	Developer / Backend Engineer

📜 License
This project is licensed under the MIT License.
Feel free to use, modify, and distribute it with proper credit.

❤️ Support
If you like this project, don’t forget to ⭐ star the repository on GitHub!
Feedback and contributions are always welcome.
