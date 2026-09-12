# ShareWithOTP 🔒⚡

> **Privacy-First Temporary Peer-to-Peer Large-File Transfer Platform**  
> Direct browser-to-browser file sharing via WebRTC `RTCDataChannel` with ephemeral 6-digit OTP verification and automatic session destruction.

---

## 🚀 Architectural Guarantee: Zero File Storage

The actual file **NEVER** touches, passes through, or persists on the backend server. 

The FastAPI backend is responsible exclusively for:
1. Temporary room & session lifecycle management
2. Cryptographically secure OTP generation & salted hashing
3. WebRTC signaling relay (SDP Offer/Answer & ICE candidate exchange)
4. Session destruction upon completion or timeout

```
                React Frontend (Browser A & B)
                             │
                HTTPS / WSS  │ (Signaling, OTP, Ephemeral State ONLY)
                             ▼
                    FastAPI Backend
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
           Room Store    OTP Security    Signaling
           (Ephemeral)   (Salted Hash)   (Relay Only)
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                    Direct WebRTC P2P
            ╔═════════════════════════════════╗
            ║                                 ║
         Sender                            Receiver
            ║                                 ║
            ╚═══════ RTCDataChannel ══════════╝
                     (Binary Chunks)
                   (No Server Storage)
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Clean, minimal dark navy / slate palette)
- **Networking**: WebRTC (`RTCPeerConnection`, `RTCDataChannel`), WebSocket Client
- **Hashing**: `hash-wasm` (WebAssembly-accelerated streaming SHA-256)
- **Icons**: `lucide-react`

### Backend
- **Framework**: Python 3.11+ FastAPI + Uvicorn
- **Signaling**: WebSocket + `asyncio`
- **Validation**: Pydantic v2 & `pydantic-settings`
- **Security**: Python `secrets` for cryptographic random generation, constant-time comparison `hmac.compare_digest`, salted SHA-256
- **Persistence**: In-memory ephemeral session manager with scheduled background garbage collection

---

## 🔄 End-to-End Workflow

```
Sender (Browser A)                       Receiver (Browser B)
      │                                            │
      │ 1. Choose Room ID ("dinesh123")            │
      ├───────────────────────────────────────────►│
      │ 2. Backend generates OTP ("583921")        │
      │    Returns OTP + sender_token              │
      │                                            │
      │ 3. Sender shares Room ID & OTP             │
      │───────────────────────────────────────────►│
      │                                            │
      │                                            │ 4. Enters Room ID & OTP
      │                                            │    Backend validates hash
      │                                            │    Returns receiver_token
      │                                            │    Invalidates OTP
      │                                            │
      │◄────────── 5. WebRTC Signaling ───────────►│
      │    (Relayed via FastAPI WebSocket)         │
      │                                            │
      │ 6. Direct P2P WebRTC Connection Open       │
      │════════════════════════════════════════════│
      │                                            │
      │ 7. Streams File in 64 KB Binary Chunks     │
      │    (Backpressure: bufferedAmountLow)       │
      │    (Incremental WASM SHA-256 digest)       │
      │═══════════════════════════════════════════►│
      │                                            │ 8. Reconstructs Blob
      │                                            │    Verifies SHA-256
      │                                            │    Triggers Download
      │                                            │
      │ 9. "transfer-complete" notification sent    │
      ├───────────────────────────────────────────►│
      │                                            │
      ▼                                            ▼
           ROOM DESTROYED • OTP PURGED • STATE ERASED
```

---

## 💻 Local Setup & Running

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows Powershell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Install aiortc for the automated verification suite
pip install aiortc

# Start the development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will run on `http://127.0.0.1:8000` (API docs available at `/docs`).

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The frontend will run on `http://localhost:5173` and automatically proxies `/api` and `/ws` to `http://localhost:8000`.

---

## 🧪 Testing Suite

### Backend Unit & Integration Tests (10 tests)
Verifies OTP cryptographic generation, salted hashing, rate limiting, room collisions, room lifecycle, and WebSocket signaling relay:
```bash
cd backend
.\venv\Scripts\pytest -v
```

### Full Live P2P WebRTC DataChannel End-to-End Test
Executes a live WebRTC transfer of 10 MB in 64 KB slices over `RTCDataChannel`, validates SHA-256 cryptographic parity, and verifies room destruction:
```bash
cd backend
.\venv\Scripts\python.exe run_e2e.py
```

### Frontend TypeScript Build & Lint
```bash
cd frontend
npm run build
```

---

## 🛡️ Security & Privacy Architecture

- **No Plaintext OTP Storage**: OTPs are generated using Python's `secrets.randbelow()` (OS entropy), salted with 32-character random hex salts, and hashed with SHA-256. Only the hash is retained in memory.
- **Brute-Force Lockout**: Verification is capped at 5 failed attempts. On the 5th failed attempt, the room transitions to `LOCKED` status and rejects all further requests.
- **Sliding-Window Rate Limiting**: Verification requests are rate-limited to 10 per minute per IP.
- **One-Time Authentication**: As soon as a receiver authenticates, the OTP hash is purged from memory, preventing any replay or duplicate connections.
- **Self-Destructing Rooms**: Upon transfer completion, both peers are disconnected, WebSocket connections are closed with code 1000, and the room record is purged. A destroyed room ID cannot be reused.
- **Auto-Expiration Garbage Collection**: Any room inactive or unjoined past 15 minutes is automatically purged by an asyncio background cleaner task.
- **No File Logging**: Server logs record only anonymous session lifecycle states (never file names, contents, or hashes).

---

## 🌐 WebRTC Signaling & Streaming Mechanics

### SCTP DataChannel Backpressure
To support transferring files larger than 100 MB up to multi-gigabytes without crashing browser tab memory:
1. Slices the file using `file.slice(start, end)` into 64 KB chunks.
2. Inspects `dataChannel.bufferedAmount`. If it exceeds the high water mark (4 MB), reading pauses.
3. Attaches a one-time listener for the `bufferedamountlow` event (threshold: 512 KB) to resume reading.
4. Uses pure binary `ArrayBuffer` frames (never base64 strings).

### WASM-Accelerated Streaming SHA-256
- Computes SHA-256 progressively as slices are read using `hash-wasm`.
- Avoids loading the full file into memory twice.
- Receiver computes its hash incrementally as chunks arrive and verifies against the sender's trailer digest.

---

## 🔮 Phase 2 Roadmap
- **TURN Server Integration**: Configurable COTURN fallback for symmetric NATs.
- **Chunk Acknowledgements & Resumable Transfers**: SCTP chunk index ACKs to resume interrupted large transfers.
- **End-to-End Payload Encryption**: Web Cryptography AES-GCM layer atop SCTP DataChannels.
- **Redis State Storage**: Distributed room sessions for multi-instance backend clustering.
- **Multi-File / Directory Streaming**: Tar/zip streaming chunking directly in browser.
