import { Link, NavLink, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './AppShell.css';

function AppShell() {
  return (
    <div className='app-shell'>
      <Navbar />
      <main className='app-main'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppShell;
