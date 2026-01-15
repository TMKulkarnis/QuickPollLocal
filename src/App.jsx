import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreatePoll } from './pages/CreatePoll';
import { PollDetail } from './pages/PollDetail';
import { Layout } from './components/Layout';
import { PollProvider } from './context/PollContext';
import { MyPolls } from './pages/MyPolls'; // Verified import
import { MapView } from './pages/MapView';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <PollProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollDetail />} />
            <Route path="/polls" element={<MyPolls />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </PollProvider>
    </BrowserRouter>
  );
}

export default App;
