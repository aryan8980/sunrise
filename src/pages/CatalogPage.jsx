import { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { listCategories } from '../services/categoryService';
import { listProducts } from '../services/productService';
import './CatalogPage.css';

const defaultFilters = { category: '', size: '' };

function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [filterOptions, setFilterOptions] = useState({
    sizes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    listProducts()
      .then((allProducts) => {
        const sizeSet = new Set();
        allProducts.forEach((product) => {
          (product.sizes || []).forEach((size) => sizeSet.add(size));
        });
        setFilterOptions({
          sizes: [...sizeSet].sort()
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await listProducts(filters);
        if (!ignore) setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProducts();
    return () => { ignore = true; };
  }, [filters]);

  return (
    <section className='page container catalog-page'>
      <div className='catalog-head'>
        <p className='catalog-head__eyebrow'>Sunrise Apparels</p>
        <h1 className='section-title'>Product Catalog</h1>
      </div>

      <div className='catalog-controls form-card'>
        <FilterBar
          filters={filters}
          onChange={setFilters}
          categories={categories}
          sizes={filterOptions.sizes}
        />
        <p className='catalog-results'>
          {loading ? (
            'Loading...'
          ) : (
            <>Showing <strong>{products.length}</strong> product{products.length === 1 ? '' : 's'}</>
          )}
        </p>
      </div>

      <div className='grid catalog-grid'>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className='catalog-empty form-card'>No products found for the selected filters.</div>
        )}
      </div>
    </section>
  );
}

export default CatalogPage;
