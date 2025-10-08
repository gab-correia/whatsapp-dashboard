import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { Dashboard } from './pages/Dashboard';
import { Messages } from './pages/Messages';
import { Contacts } from './pages/Contacts';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;