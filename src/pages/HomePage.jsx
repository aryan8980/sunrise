import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { useEffect, useState } from 'react';
import { listProducts } from '../services/productService';
import './HomePage.css';

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [heroImages, setHeroImages] = useState([]);

  useEffect(() => {
    listProducts()
      .then((products) => {
        const bestselling = [...products]
          .sort((a, b) => Number(b.viewsCount || 0) - Number(a.viewsCount || 0))
          .slice(0, 4);
        setFeatured(bestselling);

        const productImages = bestselling.flatMap((product) => product.images || []);
        const uniqueImages = [...new Set(productImages)].slice(0, 8);
        setHeroImages(uniqueImages);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <HeroBanner images={heroImages} />
      <section className='page container home-products'>
        <div className='home-products__head'>
          <p className='home-products__eyebrow'>Curated Selection</p>
          <h2 className='section-title home-title'>Bestselling Products</h2>
        </div>

        {featured.length > 0 ? (
          <div className='grid home-featured'>
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className='home-products__empty form-card'>
            No bestselling products available yet.
          </div>
        )}
      </section>
    </>
  );
}

export default HomePage;
