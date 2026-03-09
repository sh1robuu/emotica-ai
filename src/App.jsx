/**
 * App.jsx – Root Application Component
 * =====================================
 * Sets up React Router with all routes.
 * Protected routes redirect to /login when not authenticated.
 *
 * Route Map:
 *   /           → Landing page (public)
 *   /login      → Login page (public)
 *   /register   → Register page (public)
 *   /chat       → Chat page (protected, uses ChatLayout)
 *   /feedback   → Feedback page (protected, uses MainLayout)
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import ChatLayout from './layouts/ChatLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Feedback from './pages/Feedback';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Landing />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout>
              <Login />
            </MainLayout>
          }
        />
        <Route
          path="/register"
          element={
            <MainLayout>
              <Register />
            </MainLayout>
          }
        />

        {/* Protected routes */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout>
                <Chat />
              </ChatLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Feedback />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
