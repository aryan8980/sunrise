import { useEffect, useState } from 'react';
import { addProduct, deleteProduct, listProducts, updateProduct, uploadMultipleProductImages } from '../services/productService';
import { addCategory, listCategories } from '../services/categoryService';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import './ProductManagementPage.css';

const initialProduct = {
  name: '',
  category: '',
  description: '',
  sizes: 'S,M,L',
  available: true,
  images: [],
  price: 0
};

function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialProduct);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProducts = () => listProducts().then(setProducts).catch(console.error);
  const loadCategories = () => listCategories().then(setCategories).catch(console.error);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);

    // Create previews
    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setImagePreviews);
  };

  const removeImagePreview = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editingId && selectedFiles.length === 0) {
      toast.error('Please select at least one image.');
      return;
    }

    const resolvedCategory = form.category.trim();

    if (!resolvedCategory) {
      toast.error('Category is required.');
      return;
    }

    const hasCategory = categories.some(
      (category) => (category.name || '').toLowerCase() === resolvedCategory.toLowerCase()
    );

    if (!hasCategory) {
      await addCategory({
        name: resolvedCategory,
        order: categories.length + 1
      });
      await loadCategories();
    }

    setUploading(true);
    try {
      const imageUrls = selectedFiles.length > 0
        ? await uploadMultipleProductImages(selectedFiles)
        : (Array.isArray(form.images) ? form.images : []);

      const payload = {
        ...form,
        category: resolvedCategory,
        sizes: form.sizes.split(',').map((size) => size.trim()),
        images: imageUrls,
        price: Number(form.price)
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await addProduct(payload);
      }

      setForm(initialProduct);
      setSelectedFiles([]);
      setImagePreviews([]);
      setEditingId(null);
      toast.success(editingId ? 'Product updated successfully.' : 'Product added successfully.');
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleQuickAddCategory = async () => {
    const name = window.prompt('Add new category');
    if (!name) return;

    const trimmed = name.trim();
    if (!trimmed) return;

    const exists = categories.some((category) => category.name?.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      await addCategory({ name: trimmed, order: categories.length + 1 });
      await loadCategories();
      toast.success('Category added successfully.');
    }
    setForm({ ...form, category: trimmed });
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setShowForm(true);
    setForm({
      ...product,
      sizes: (product.sizes || []).join(',')
    });
    // Set existing images as previews
    setSelectedFiles([]);
    setImagePreviews(product.images || []);
  };

  return (
    <section className='product-module'>
      <div className='product-module__top'>
        <h1 className='section-title'>Products</h1>
        <div className='product-module__chips'>
          <span className='product-chip product-chip--active'>Products ({products.length})</span>
          <span className='product-chip'>Categories ({categories.length})</span>
        </div>
        <button
          className='btn product-module__add'
          type='button'
          onClick={() => {
            setShowForm((prev) => !prev);
            if (showForm) {
              setEditingId(null);
              setForm(initialProduct);
              setSelectedFiles([]);
              setImagePreviews([]);
            }
          }}
        >
          + Add New Product
        </button>
      </div>

      {showForm && (
        <form className='form-card product-form product-form--premium' onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

          <div className='product-form__row'>
            <label className='product-form__field'>
              <span>Product Name *</span>
              <input
                placeholder='Enter product name'
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <div className='product-form__field'>
              <span>Category *</span>
              <div className='product-form__category'>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                  <option value=''>Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button type='button' className='btn btn--ghost product-form__plus' onClick={handleQuickAddCategory}>
                  +
                </button>
              </div>
            </div>
          </div>

          <label className='product-form__field'>
            <span>Price *</span>
            <input
              type='number'
              placeholder='Enter price'
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </label>

          <label className='product-form__field'>
            <span>Description *</span>
            <textarea
              placeholder='Describe the product...'
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows='5'
              required
            />
          </label>

          <label className='product-form__field'>
            <span>Product Images *</span>
            <input
              type='file'
              multiple
              accept='image/*'
              onChange={handleImageSelect}
            />
          </label>

          {imagePreviews.length > 0 && (
            <div className='product-form__field'>
              <span>Image Previews</span>
              <div className='product-form__preview-grid'>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className='product-form__preview-item'>
                    <img src={preview} alt={`Preview ${index}`} />
                    <button
                      type='button'
                      className='btn btn--ghost product-form__remove-btn'
                      onClick={() => removeImagePreview(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='product-form__extras'>
            <label>
              <span>Sizes (comma separated)</span>
              <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
            </label>
          </div>

          <div className='product-form__stock'>
            <span>Stock Status *</span>
            <label>
              <input
                type='radio'
                name='stockStatus'
                checked={form.available === true}
                onChange={() => setForm({ ...form, available: true })}
              />
              In Stock
            </label>
            <label>
              <input
                type='radio'
                name='stockStatus'
                checked={form.available === false}
                onChange={() => setForm({ ...form, available: false })}
              />
              Out of Stock
            </label>
          </div>

          <button className='btn' type='submit' disabled={uploading}>
            {uploading ? 'Uploading...' : editingId ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      <div className='product-grid'>
        {products.map((product) => (
          <article className='product-tile' key={product.id}>
            <img src={product.images?.[0]} alt={product.name} loading='lazy' />
            <div className='product-tile__body'>
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <strong>{formatCurrency(product.price)}</strong>
            </div>
            <div className='product-tile__actions'>
              <button className='btn btn--ghost' onClick={() => handleEdit(product)}>
                Edit
              </button>
              <button className='btn btn--ghost' onClick={() => {
                deleteProduct(product.id).then(() => {
                  toast.success('Product deleted.');
                  loadProducts();
                })
              }}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProductManagementPage;
