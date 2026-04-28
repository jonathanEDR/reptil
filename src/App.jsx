import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import AuthSync from './components/AuthSync';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Connectors from './pages/Connectors';
import ConnectorForm from './pages/ConnectorForm';
import Agent from './pages/Agent';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthSync />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Layout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="connectors" element={<Connectors />} />
          <Route path="connectors/new" element={<ConnectorForm />} />
          <Route path="connectors/:id/edit" element={<ConnectorForm />} />
          <Route path="agent" element={<Agent />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
