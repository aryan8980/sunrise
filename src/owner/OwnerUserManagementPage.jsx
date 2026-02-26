import { useEffect, useState } from 'react';
import {
  createAdminUser,
  deleteManagedUserDoc,
  listAdminUsers,
  updateManagedUser
} from '../services/authService';
import toast from 'react-hot-toast';
import './OwnerUserManagementPage.css';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'manager'
};

function OwnerUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadUsers = () => listAdminUsers().then(setUsers).catch(console.error);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      await createAdminUser(form);
      setForm(initialForm);
      toast.success('User created successfully.');
      loadUsers();
    } catch (error) {
      toast.error(error?.message || 'Failed to create user.');
      console.error(error);
    }
  };

  const toggleAccess = async (user) => {
    await updateManagedUser(user.id, { active: user.active === false });
    toast.success(`User access ${user.active === false ? 'enabled' : 'disabled'}.`);
    loadUsers();
  };

  const changeRole = async (user, role) => {
    await updateManagedUser(user.id, { role });
    toast.success(`Role changed to ${role}`);
    loadUsers();
  };

  return (
    <section>
      <h1 className='section-title'>User Access Management</h1>

      <form className='form-card owner-user-form' onSubmit={handleCreate}>
        <input
          placeholder='Full name'
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type='email'
          placeholder='Email'
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type='password'
          placeholder='Temporary password'
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          minLength={6}
          required
        />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value='manager'>Manager</option>
          <option value='owner'>Owner</option>
        </select>
        <button className='btn' type='submit'>Create User</button>
      </form>

      <div className='table-wrap'>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || '-'}</td>
                <td>{user.email}</td>
                <td>
                  <select value={user.role || 'manager'} onChange={(e) => changeRole(user, e.target.value)}>
                    <option value='manager'>Manager</option>
                    <option value='owner'>Owner</option>
                  </select>
                </td>
                <td>{user.active === false ? 'Suspended' : 'Active'}</td>
                <td>
                  <button className='btn btn--ghost' onClick={() => toggleAccess(user)}>
                    {user.active === false ? 'Enable' : 'Disable'}
                  </button>{' '}
                  <button className='btn btn--ghost' onClick={() => deleteManagedUserDoc(user.id).then(() => {
                    toast.success('User document deleted');
                    loadUsers();
                  })}>
                    Delete Doc
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OwnerUserManagementPage;
