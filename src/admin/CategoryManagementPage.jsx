import { useEffect, useState } from 'react';
import { addCategory, deleteCategory, listCategories, updateCategory } from '../services/categoryService';
import { listProducts } from '../services/productService';
import toast from 'react-hot-toast';
import './CategoryManagementPage.css';

function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');

  const loadCategories = () => listCategories().then(setCategories).catch(console.error);
  const loadProducts = () => listProducts().then(setProducts).catch(console.error);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    const exists = categories.some((category) => category.name?.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast.error('Category already exists.');
      return;
    }

    await addCategory({ name: trimmed, order: categories.length + 1 });
    setName('');
    toast.success('Category added successfully.');
    loadCategories();
    loadProducts();
  };

  return (
    <section className='category-module'>
      <div className='category-module__top'>
        <h1 className='section-title'>Categories</h1>
        <div className='category-module__chips'>
          <span className='category-chip category-chip--active'>Categories ({categories.length})</span>
        </div>
      </div>

      <form className='form-card category-form category-form--premium' onSubmit={handleAdd}>
        <label>
          <span>Add New Category</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Enter category name' required />
        </label>
        <button className='btn category-form__add' type='submit'>
          + Add Category
        </button>
      </form>

      <div className='category-grid'>
        {categories.map((category) => (
          <article key={category.id} className='category-card'>
            {(() => {
              const categoryProductCount = products.filter(
                (product) =>
                  (product.category || '').trim().toLowerCase() === (category.name || '').trim().toLowerCase()
              ).length;
              return (
                <>
                  <div className='category-card__head'>
                    <h3>{category.name}</h3>
                    <span>#{category.order || '-'}</span>
                  </div>
                  <p className='category-card__count'>{categoryProductCount} products</p>
                  <div className='category-card__actions'>
                    <button
                      className='btn btn--ghost'
                      onClick={() => {
                        const newName = window.prompt('Rename category', category.name);
                        if (newName?.trim()) {
                          updateCategory(category.id, { name: newName.trim() }).then(() => {
                            toast.success('Category renamed.');
                            loadCategories();
                          });
                        }
                      }}
                    >
                      Edit
                    </button>
                    <button className='btn btn--ghost' onClick={() => deleteCategory(category.id).then(() => {
                      toast.success('Category deleted.');
                      loadCategories();
                    })}>
                      Delete
                    </button>
                  </div>
                </>
              );
            })()}
          </article>
        ))}
      </div>
    </section>
  );
}

export default CategoryManagementPage;
