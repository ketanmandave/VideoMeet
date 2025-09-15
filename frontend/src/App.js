import LandingPage from './pages/landingPage.jsx';
import Authentication from './pages/authentication.jsx';
import AuthProvider from './context/AuthContext.jsx';
import VideoMeet from './pages/VideoMeet.jsx';
import HomePage from './pages/home.jsx';
import History from './pages/History.jsx';
import {Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path='/:url' element={<VideoMeet />} />
        <Route path='/home' element={<HomePage/>}/>
        <Route path='/history' element={<History />} />
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
