import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const result = await login(email, password);
      if (!result.active || !result.role) {
        await logoutUser();
        throw new Error('unauthorized');
      }
      const next = location.state?.from?.pathname || '/admin';
      navigate(next, { replace: true });
    } catch (err) {
      setError('Invalid credentials or unauthorized user.');
      console.error(err);
    }
  };

  return (
    <section className='page container login-page'>
      <form className='form-card login-form' onSubmit={handleSubmit}>
        <h1 className='section-title'>Admin Login</h1>
        <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className='btn' type='submit'>
          Sign In
        </button>
        {error && <p className='status'>{error}</p>}
      </form>
    </section>
  );
}

export default LoginPage;
