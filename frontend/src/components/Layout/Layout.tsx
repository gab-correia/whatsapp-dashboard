import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/connection', label: 'Conexão', icon: '🔌' },
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/messages', label: 'Mensagens', icon: '💬' },
    { path: '/contacts', label: 'Contatos', icon: '👥' },
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navbarContent}>

          <div className={styles.logoText}>
            <h1 className={styles.logoTitle}>Lio</h1>
          </div>

          {/* Navigation */}
          <div className={styles.nav}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {/* Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}