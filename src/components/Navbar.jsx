import { NavLink } from 'react-router-dom';
import logo from '../assets/apex-logo.jpeg';
import './Navbar.css';

function Navbar() {
  return (
    <header>
      <div className='site-header'>
        <div className='site-header__inner'>
          <img src={logo} alt='Sunrise Apparels' className='navbar__logo' />
          <h1 className='site-header__title'>Sunrise Apparels</h1>
        </div>
      </div>
      <div className='navbar'>
        <div className='navbar__inner'>
          <nav className='navbar__links'>
            <NavLink to='/'>Home</NavLink>
            <NavLink to='/catalog'>Catalog</NavLink>
            <NavLink to='/about'>About</NavLink>
            <NavLink to='/stores'>Stores</NavLink>
            <NavLink to='/contact'>Contact</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
