import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenu from './pages/AdminMenu';
import AdminOrders from './pages/AdminOrders';
import KitchenView from './pages/KitchenView';
import AdminSettings from './pages/AdminSettings';
import CustomerMenu from './pages/CustomerMenu';
import AdminLayout from './components/AdminLayout';
import { RestaurantProvider } from './hooks/useRestaurant';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#EA1D2C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Landing / SaaS */}
        <Route path="/" element={<Home />} />
        
        {/* Auth */}
        <Route path="/login" element={user ? <Navigate to="/admin" /> : <Login />} />
        
        {/* Customer Face */}
        <Route path="/r/:slug" element={<CustomerMenu />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={user ? <RestaurantProvider><AdminLayout /></RestaurantProvider> : <Navigate to="/login" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Standalone Kitchen View */}
        <Route path="/admin/kitchen" element={user ? <RestaurantProvider><KitchenView /></RestaurantProvider> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
