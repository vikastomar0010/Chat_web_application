# 💬 MERN Real-Time Chat Application

- A full-stack, production-grade real-time chat application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with Socket.io enabling low-latency, bidirectional communication between clients and server.

- The system supports one-to-one and group conversations with real-time synchronization of messages, ensuring instant delivery without page reloads. Implemented advanced messaging capabilities including image sharing using Multer for file handling and Cloudinary for scalable cloud storage.

- Engineered a complete message lifecycle tracking system with states such as **sent, delivered, and seen**, mimicking modern messaging platforms like WhatsApp. Designed efficient socket event handling to avoid duplication, ensure proper event cleanup, and maintain consistent UI updates across multiple clients.

- Integrated real-time typing indicators and dynamic online/offline user presence using socket-based user tracking. Built secure authentication using JWT, protecting API routes and maintaining user sessions.

- Developed modular RESTful APIs for chats, users, and messages with optimized database queries using Mongoose. Applied React Context API for global state management and Chakra UI for building a responsive and user-friendly interface.

- The application is designed with scalability and performance in mind, handling concurrent users efficiently while maintaining real-time responsiveness and smooth user experience.

---

## 🚀 Features

### 🔐 Authentication
- JWT-based login & signup
- Secure user sessions
- Protected routes

### 💬 Chat System
- One-to-one chat
- Group chat support
- Real-time messaging using Socket.io
- Chat list with latest message preview

### 🖼️ Media Sharing
- Image upload using Multer
- Cloudinary integration for storage
- Send and receive images in chat

### ⚡ Real-Time Features
- Typing indicator
- Instant message delivery
- No page reload required

### ✅ Message Status
- ✓ Sent  
- ✓✓ Delivered  
- ✓✓ (Blue) Seen  

### 🟢 Online Status
- Shows online/offline users
- Updates in real-time

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Chakra UI
- Axios
- Context API
- Socket.io-client

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.io
- Multer
- Cloudinary

---

## 📁 Project Structure
Chat-Application/
- │
- ├── backend/
- │ ├── controller/
- │ ├── model/
- │ ├── routes/
- │ ├── middleware/
- │ ├── utils/
- │ ├── db/
- │ └── index.js
- │
- ├── frontend/
- │ ├── src/
- │ │ ├── components/
- │ │ ├── Chats/
- │ │ ├── pages/
- │ │ ├── Context/
- │ │ └── config.js
- │
- └── README.md


---

## ⚙️ Environment Variables

### Backend (.env)

---

## ⚙️ Environment Variables

### Backend (.env)
- PORT=5000
- DB_CONNECT_URI=your_mongodb_uri
- JWT_SECRET=your_secret
- CLOUD_NAME=your_cloudinary_name
- API_KEY=your_cloudinary_key
- API_SECRET=your_cloudinary_secret
- CLIENT_ORIGIN=http://localhost:3000

---

## 🧑‍💻 Installation & Setup

### 1. Clone Repository
- git clone https://github.com/your-username/chat-app.git
- cd chat-app

### 2. Backend Setup
- cd backend
- npm install
- npm run dev


### 3. Frontend Setup
- cd frontend
- npm install
- npm start
