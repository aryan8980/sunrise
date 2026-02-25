import StoreCard from '../components/StoreCard';
import './StoreLocatorPage.css';

const stores = [
  {
    name: 'Sunrise Studio - Manhattan',
    address: '315 Broadway, New York, NY 10007',
    hours: 'Mon-Sat: 10:00 AM - 8:00 PM',
    contact: '+91 98814 40099',
    mapEmbed: 'https://www.google.com/maps?q=315+Broadway+New+York+NY+10007&output=embed'
  }
];

function StoreLocatorPage() {
  return (
    <section className='page container store-locator-page'>
      <div className='store-locator-head'>
        <p className='store-locator-head__eyebrow'>Sunrise Apparels</p>
        <h1 className='section-title'>Store Locator</h1>
        <p className='store-locator-head__text'>
          Find our flagship retail spaces, explore store timings, and connect directly with each location.
        </p>
      </div>
      <div className='grid store-grid'>
        {stores.map((store) => (
          <StoreCard key={store.name} store={store} />
        ))}
      </div>
    </section>
  );
}

export default StoreLocatorPage;
