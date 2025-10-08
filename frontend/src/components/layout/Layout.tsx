import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => {
    const base = "px-4 py-2 rounded-lg transition-colors";
    return isActive(path)
      ? `${base} bg-blue-600 text-white`
      : `${base} text-gray-700 hover:bg-gray-200`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">
                📱 WhatsApp Dashboard
              </h1>
              
              <div className="flex space-x-4">
                <Link to="/" className={navLinkClass('/')}>
                  📊 Dashboard
                </Link>
                <Link to="/messages" className={navLinkClass('/messages')}>
                  💬 Mensagens
                </Link>
                <Link to="/contacts" className={navLinkClass('/contacts')}>
                  👥 Contatos
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}