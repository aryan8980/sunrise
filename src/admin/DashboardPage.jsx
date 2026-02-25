import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../services/analyticsService';
import './DashboardPage.css';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInquiries: 0,
    mostViewedProducts: [],
    monthlyAnalytics: []
  });

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <section>
      <h1 className='section-title'>Dashboard</h1>
      <div className='dashboard-stats'>
        <StatCard label='Total Products' value={stats.totalProducts} />
        <StatCard label='Total Inquiries' value={stats.totalInquiries} />
      </div>

      <div className='form-card'>
        <h3>Most Viewed Products</h3>
        <ul>
          {stats.mostViewedProducts.map((product) => (
            <li key={product.id}>
              {product.name} ({product.viewsCount || 0} views)
            </li>
          ))}
        </ul>
      </div>

      <div className='form-card'>
        <h3>Monthly Analytics</h3>
        <ul>
          {stats.monthlyAnalytics.map((row) => (
            <li key={row.month}>
              {row.label}: {row.inquiries} inquiries, {row.productsAdded} products added
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default DashboardPage;
