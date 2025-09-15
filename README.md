# Video Meet

A real-time video conferencing application built with React and Node.js, featuring secure authentication, meeting management, and WebRTC-based video communication.

## Features

- **Real-time Video Calls**: WebRTC-based peer-to-peer video communication
- **User Authentication**: Secure login and registration system
- **Meeting Management**: Create, join, and manage video meetings
- **Meeting History**: Track and view past meetings
- **Responsive Design**: Works on desktop and mobile devices
- **Socket.io Integration**: Real-time communication and signaling

## Tech Stack

### Frontend
- React 19.1.1
- Material-UI (MUI) for UI components
- React Router for navigation
- Socket.io Client for real-time communication
- Axios for HTTP requests

### Backend
- Node.js with Express 5.1.0
- MongoDB with Mongoose for data persistence
- Socket.io for real-time communication
- bcrypt for password hashing
- CORS enabled for cross-origin requests

## Project Structure

```
video-meet/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── socketManager.js
│   │   │   └── userController.js
│   │   ├── models/
│   │   │   ├── meetingModel.js
│   │   │   └── userModel.js
│   │   ├── routes/
│   │   │   └── userRoutes.js
│   │   └── index.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   └── App.js
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string_here
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Registration/Login**: Create an account or login with existing credentials
2. **Home Dashboard**: Access your meeting dashboard
3. **Create Meeting**: Generate a new meeting room with a unique URL
4. **Join Meeting**: Enter a meeting using the room URL
5. **Video Conference**: Enjoy real-time video and audio communication
6. **Meeting History**: View your past meetings and details

## API Endpoints

### Authentication
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login

### Meetings
- `GET /api/v1/users/meetings` - Get user meetings
- `POST /api/v1/users/meetings` - Create new meeting

## Socket Events

- `connection` - User connects to socket
- `join-room` - User joins a meeting room
- `offer` - WebRTC offer signal
- `answer` - WebRTC answer signal
- `ice-candidate` - ICE candidate exchange
- `disconnect` - User disconnects

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Environment Variables

### Backend (.env)
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/videomeet
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SOCKET_URL=http://localhost:8000
```

## Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prod` - Start with PM2 (production)

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## License

This project is licensed under the ISC License.

## Author

**Ketan Mandave**

## Acknowledgments

- WebRTC for peer-to-peer communication
- Socket.io for real-time messaging
- Material-UI for beautiful UI components
- MongoDB for data persistence
