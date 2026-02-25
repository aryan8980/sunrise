import './FilterBar.css';

function FilterBar({ filters, onChange, categories, sizes }) {
  const setFilter = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className='filter-bar'>
      <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
        <option value=''>All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
      <select value={filters.size} onChange={(e) => setFilter('size', e.target.value)}>
        <option value=''>All Sizes</option>
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterBar;
