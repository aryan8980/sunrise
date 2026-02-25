import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className='page container'>
      <h1 className='section-title'>Page Not Found</h1>
      <Link to='/'>Back to Home</Link>
    </section>
  );
}

export default NotFoundPage;
