import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const priceLabel = `\u20b9${Number(product.price || 0).toLocaleString('en-IN')}`;
  const productId = product?.id || product?.productId || product?.docId || '';
  const routeId = productId ? encodeURIComponent(String(productId).trim()) : '';

  const linkProps = routeId
    ? { to: { pathname: `/products/${routeId}`, state: { product } } }
    : { to: '/catalog' };

  return (
    <Link {...linkProps} className='product-card'>
      <img src={product.images?.[0]} alt={product.name} loading='lazy' />
      <div className='product-card__body'>
        <span className='product-card__chip'>{product.category || 'Category'}</span>
        <h3>{product.name}</h3>
        <p className='product-card__desc'>{product.description || 'No description available.'}</p>
        <p className='product-card__price'>{priceLabel}</p>
        <div className='product-card__meta'>
          <p className={product.available ? 'status status--available' : 'status'}>
            {product.available ? 'Available' : 'Out of stock'}
          </p>
          <span className='product-card__link'>View Details</span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
