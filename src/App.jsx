import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreatePoll } from './pages/CreatePoll';
import { PollDetail } from './pages/PollDetail';
import { Layout } from './components/Layout';
import { PollProvider } from './context/PollContext';
import { NotificationProvider } from './context/NotificationContext';
import { MyPolls } from './pages/MyPolls'; // Verified import
import { MapView } from './pages/MapView';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <PollProvider>
        <NotificationProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/create" element={<ProtectedRoute><CreatePoll /></ProtectedRoute>} />
              <Route path="/poll/:id" element={<ProtectedRoute><PollDetail /></ProtectedRoute>} />
              <Route path="/polls" element={<ProtectedRoute><MyPolls /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </NotificationProvider>
      </PollProvider>
    </BrowserRouter>
  );
}

export default App;
