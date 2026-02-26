import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { useEffect, useState } from 'react';
import { listProducts } from '../services/productService';
import './HomePage.css';

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [heroImages, setHeroImages] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const products = await listProducts();
        if (ignore) return;

        const bestselling = [...products]
          .sort((a, b) => Number(b.viewsCount || 0) - Number(a.viewsCount || 0))
          .slice(0, 4);
        setFeatured(bestselling);

        const productImages = bestselling.flatMap((product) => product.images || []);
        const uniqueImages = [...new Set(productImages)].slice(0, 8);
        setHeroImages(uniqueImages);
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProducts();
    return () => { ignore = true; };
  }, []);

  return (
    <>
      <HeroBanner images={heroImages} />
      <section className='page container home-products'>
        <div className='home-products__head'>
          <p className='home-products__eyebrow'>Curated Selection</p>
          <h2 className='section-title home-title'>Bestselling Products</h2>
        </div>

        <div className='grid home-featured'>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : featured.length > 0 ? (
            featured.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className='home-products__empty form-card'>
              No bestselling products available yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default HomePage;
