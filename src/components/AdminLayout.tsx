import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Menu as MenuIcon,
  X,
  Store
} from 'lucide-react';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Pedidos', path: '/admin/orders', icon: ClipboardList },
    { name: 'Cozinha', path: '/admin/kitchen', icon: UtensilsCrossed },
    { name: 'Cardápio', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Configurações', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-[#EA1D2C] p-2 rounded-lg text-white">
              <Store size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">FoodSaaS</span>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-[#EA1D2C]/10 text-[#EA1D2C]" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600"
          >
            <MenuIcon size={24} />
          </button>
          
          <div className="flex-1 lg:flex-none">
            <h2 className="font-semibold text-gray-800">
              {navItems.find(i => i.path === location.pathname)?.name || 'Admin'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2">
               <span className="text-sm font-medium text-gray-700">{auth.currentUser?.displayName}</span>
               <img 
                 src={auth.currentUser?.photoURL || ''} 
                 alt="User" 
                 className="w-8 h-8 rounded-full border"
               />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
