import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Settings, PlusCircle, Menu, ChevronRight, BookMarked,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Dashboard from './pages/Dashboard.tsx';
import BookDetail from './pages/BookDetail.tsx';
import NewBookModal from './components/NewBookModal.tsx';
import SettingsPage from './pages/SettingsPage.tsx';

function Layout({ children, onNewBook }: { children: React.ReactNode; onNewBook: () => void }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Mes Livres', icon: BookOpen, path: '/books' },
    { label: 'Bibliothèque', icon: BookMarked, path: '/library' },
  ];

  const pageTitle = () => {
    if (location.pathname.startsWith('/book/')) return 'Détail du livre';
    if (location.pathname === '/settings') return 'Réglages n8n';
    if (location.pathname === '/books') return 'Mes livres';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#F5F5F0] overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shrink-0`}>
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">K</div>
          {sidebarOpen && <span className="font-bold text-base tracking-tight">KDP Master</span>}
        </div>
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}>
                <item.icon size={18} />
                {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link to="/settings">
            <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${location.pathname === '/settings' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}>
              <Settings size={18} />
              {sidebarOpen && <span className="font-medium text-sm">Réglages n8n</span>}
            </div>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={18} />
            </Button>
            <div className="flex items-center text-sm text-gray-400 gap-2">
              <span>Workspace</span>
              <ChevronRight size={12} />
              <span className="text-black font-semibold">{pageTitle()}</span>
            </div>
          </div>
          <Button onClick={onNewBook} className="bg-black text-white hover:bg-gray-800 rounded-full text-sm gap-2 h-8 px-4">
            <PlusCircle size={15} />
            Nouveau livre
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <BrowserRouter basename="/kdp-master">
      <Layout onNewBook={() => setShowModal(true)}>
        <Routes>
          <Route path="/" element={<Dashboard onNewBook={() => setShowModal(true)} />} />
          <Route path="/books" element={<Dashboard onNewBook={() => setShowModal(true)} />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
      {showModal && <NewBookModal onClose={() => setShowModal(false)} />}
    </BrowserRouter>
  );
}
