import StoreCard from '../components/StoreCard';
import './StoreLocatorPage.css';

const stores = [
  {
    name: 'Sunrise Apparels',
    address: 'Shop No. 2, Opp. Kala Mandir Apartment, Sai Vasan Shah Bazar, Ulhasnagar – 421005',
    hours: 'Tue - Sun: 10:00 AM - 8:00 PM',
    contact: '+91 98814 40099',
    mapEmbed: 'https://www.google.com/maps?q=Shop+No.+2,+Opp.+Kala+Mandir+Apartment,+Sai+Vasan+Shah+Bazar,+Ulhasnagar,+Maharashtra+421005,+India&output=embed'
  }
];

function StoreLocatorPage() {
  return (
    <section className='page container store-locator-page'>
      <div className='store-locator-head'>
        <p className='store-locator-head__eyebrow'>Sunrise Apparels</p>
        <h1 className='section-title'>Store Locator</h1>
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
