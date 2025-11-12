import time
import base64
import io
import socket
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
import qrcode
from PIL import Image

app = Flask(__name__)
app.config['SECRET_KEY'] = 'classpulse-secret'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# --- STATE ---
students = {}       # sid -> {'name': str, 'last_msg_at': float}
teachers = set()    # connected teacher sids
reaction_score_map = {'thumbs_up': 1, 'confused': -1, 'rocket': 2}
recent_events = []  # [{'type':..., 'name':..., 'ts':...}]
engagement_history = []
ENGAGEMENT_HISTORY_MAX = 60
MESSAGE_COOLDOWN = 120  # seconds

# --- HELPERS ---
def generate_qr_base64(url):
    qr = qrcode.QRCode(box_size=6, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode('ascii')}"

def broadcast_summary():
    """Send only summary info (no individual messages)."""
    summary = {
        'student_count': len(students),
        'engagement': engagement_history[-1] if engagement_history else 0,
    }
    socketio.emit('summary', summary, room='teachers')

def get_local_ip():
    """Detect your LAN IP (works on Wi-Fi, hotspot, Ethernet)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

# --- ROUTES ---
@app.route('/')
def index():
    return render_template('teacher.html')

@app.route('/student')
def student_page():
    return render_template('student.html')

@app.route('/health')
def health():
    return jsonify({'ok': True})

# --- SOCKETS ---
@socketio.on('connect')
def handle_connect():
    print(f"[CONNECT] {request.sid}")

@socketio.on('identify')
def handle_identify(data):
    role = data.get('role', 'student')
    sid = request.sid

    if role == 'teacher':
        teachers.add(sid)
        join_room('teachers')
        print(f"[TEACHER JOINED] {sid}")

        # ✅ Generate QR with LAN IP instead of 127.0.0.1
        local_ip = get_local_ip()
        student_url = f"http://{local_ip}:5000/student"
        qr_base64 = generate_qr_base64(student_url)

        emit('teacher_init', {'qr': qr_base64})
        broadcast_summary()

    else:
        print(f"[STUDENT CONNECTED] {sid} (awaiting join)")

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    if sid in teachers:
        teachers.discard(sid)
        print(f"[TEACHER LEFT] {sid}")

    elif sid in students:
        name = students[sid]['name']
        del students[sid]
        recent_events.append({'type': 'left', 'name': name, 'ts': time.time()})
        print(f"[STUDENT LEFT] {name}")

        # ✅ Notify teachers immediately (Live Presence)
        socketio.emit('student_left', {'name': name}, room='teachers')

        # Also keep compatibility with older UI systems
        socketio.emit('event', {'type': 'left', 'name': name}, room='teachers')

        broadcast_summary()

@socketio.on('student_join')
def handle_student_join(data):
    sid = request.sid
    name = (data.get('name') or "Anon").strip()

    students[sid] = {'name': name, 'last_msg_at': 0}
    recent_events.append({'type': 'joined', 'name': name, 'ts': time.time()})
    print(f"[STUDENT JOINED] {name}")

    # ✅ Notify teachers immediately (Live Presence)
    socketio.emit('student_joined', {'name': name}, room='teachers')

    # Maintain compatibility with legacy feed
    socketio.emit('event', {'type': 'joined', 'name': name}, room='teachers')

    broadcast_summary()
@socketio.on('student_leave')
def handle_student_leave():
    sid = request.sid
    if sid in students:
        name = students[sid]['name']
        del students[sid]
        recent_events.append({'type': 'left', 'name': name, 'ts': time.time()})
        print(f"[STUDENT LEFT] {name} (manual leave)")

        # Notify teachers
        socketio.emit('student_left', {'name': name}, room='teachers')
        socketio.emit('event', {'type': 'left', 'name': name}, room='teachers')

        broadcast_summary()
    else:
        print(f"[STUDENT LEAVE IGNORED] {sid} not found in students.")

@socketio.on('reaction')
def handle_reaction(data):
    sid = request.sid
    key = data.get('reaction')
    name = students.get(sid, {}).get('name', 'Anon')
    score_delta = reaction_score_map.get(key, 0)

    recent_events.append({'type': 'reaction', 'reaction': key, 'name': name, 'ts': time.time()})

    new_score = (engagement_history[-1] if engagement_history else 0) + score_delta
    new_score = max(-100, min(100, new_score))
    engagement_history.append(new_score)
    if len(engagement_history) > ENGAGEMENT_HISTORY_MAX:
        engagement_history.pop(0)

    socketio.emit('reaction', {'reaction': key, 'name': name, 'score': new_score}, room='teachers')
    broadcast_summary()

@socketio.on('message')
def handle_message(data):
    sid = request.sid
    text = (data.get('text') or '').strip()[:200]
    now = time.time()

    if sid not in students:
        emit('error', {'msg': 'Please join first.'})
        return

    last = students[sid].get('last_msg_at', 0)
    if now - last < MESSAGE_COOLDOWN:
        emit('rate_limited', {'retry_in': int(MESSAGE_COOLDOWN - (now - last))})
        return

    students[sid]['last_msg_at'] = now
    name = students[sid]['name']
    recent_events.append({'type': 'message', 'name': name, 'text': text, 'ts': now})
    print(f"[MESSAGE] {name}: {text}")

    socketio.emit('message', {'name': name, 'text': text}, room='teachers')

# --- RUN ---
if __name__ == '__main__':
    local_ip = get_local_ip()
    print(f"🚀 ClassPulse running on http://{local_ip}:5000  (accessible on LAN)")
    socketio.run(app, host='0.0.0.0', port=5000)
