import './StoreCard.css';

function StoreCard({ store }) {
  return (
    <article className='store-card'>
      <h3>{store.name}</h3>
      <div className='store-card__meta'>
        <p>
          <span>Address</span>
          {store.address}
        </p>
        <p>
          <span>Hours</span>
          {store.hours}
        </p>
        <p>
          <span>Contact</span>
          {store.contact}
        </p>
      </div>
      <iframe
        title={store.name}
        src={store.mapEmbed}
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
      />
    </article>
  );
}

export default StoreCard;
