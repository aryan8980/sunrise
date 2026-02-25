import { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
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
    listProducts(filters).then(setProducts).catch(console.error);
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
          Showing <strong>{products.length}</strong> product{products.length === 1 ? '' : 's'}
        </p>
      </div>

      {products.length > 0 ? (
        <div className='grid catalog-grid'>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className='catalog-empty form-card'>No products found for the selected filters.</div>
      )}
    </section>
  );
}

export default CatalogPage;
