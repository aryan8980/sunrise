import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminSidebar.css';

function AdminSidebar() {
  const { role, logout } = useAuth();
  const isOwner = role === 'owner';

  return (
    <aside className='admin-sidebar'>
      <h2>Admin Panel</h2>
      <nav>
        <>
          <NavLink to='/admin/dashboard'>Dashboard</NavLink>
          <NavLink to='/admin/products'>Products</NavLink>
          <NavLink to='/admin/categories'>Categories</NavLink>
          <NavLink to='/admin/inquiries'>Inquiries</NavLink>
        </>
        {isOwner && (
          <>
            <NavLink to='/admin/clients'>Clients</NavLink>
            <NavLink to='/admin/users'>Users</NavLink>
          </>
        )}
      </nav>
      <div className='admin-sidebar__footer'>
        <p>Role: {role}</p>
        <button type='button' className='btn btn--ghost' onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
