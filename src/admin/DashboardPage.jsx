import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../services/analyticsService';
import { formatCurrency } from '../utils/helpers';
import './DashboardPage.css';

const COLORS = ['#8b3250', '#e91e63', '#ff9800', '#4caf50', '#2196f3', '#9c27b0'];

function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInquiries: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyAnalytics: [],
    monthlyOrders: [],
    inquiryBreakdown: { pending: 0, ongoing: 0, done: 0 },
    productCategories: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section>
        <h1 className='section-title'>Dashboard</h1>
        <p>Loading dashboard data...</p>
      </section>
    );
  }

  // Prepare inquiry breakdown for pie chart
  const inquiryChartData = [
    { name: 'Pending', value: stats.inquiryBreakdown.pending },
    { name: 'Ongoing', value: stats.inquiryBreakdown.ongoing },
    { name: 'Done', value: stats.inquiryBreakdown.done }
  ].filter(item => item.value > 0);

  return (
    <section className='dashboard-page'>
      <h1 className='section-title'>Dashboard</h1>
      
      {/* Stats Cards */}
      <div className='dashboard-stats'>
        <StatCard label='Total Products' value={stats.totalProducts} />
        <StatCard label='Total Inquiries' value={stats.totalInquiries} />
        <StatCard label='Total Orders' value={stats.totalOrders} />
        <StatCard label='Total Revenue' value={formatCurrency(stats.totalRevenue)} />
      </div>

      {/* Charts Grid */}
      <div className='charts-grid'>
        
        {/* Monthly Orders & Revenue */}
        <div className='chart-card'>
          <h3>Monthly Orders & Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={stats.monthlyOrders}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
              <XAxis dataKey='label' tick={{ fontSize: 12 }} />
              <YAxis yAxisId='left' tick={{ fontSize: 12 }} />
              <YAxis yAxisId='right' orientation='right' tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
                formatter={(value, name) => {
                  if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                  return [value, 'Orders'];
                }}
              />
              <Legend />
              <Bar yAxisId='left' dataKey='orders' fill='#8b3250' name='Orders' />
              <Bar yAxisId='right' dataKey='revenue' fill='#e91e63' name='Revenue' />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inquiry Status Breakdown */}
        <div className='chart-card'>
          <h3>Inquiry Status Breakdown</h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={inquiryChartData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill='#8884d8'
                dataKey='value'
              >
                {inquiryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className='inquiry-stats'>
            <div className='inquiry-stat'>
              <span className='stat-badge pending'>{stats.inquiryBreakdown.pending}</span>
              <span>Pending</span>
            </div>
            <div className='inquiry-stat'>
              <span className='stat-badge ongoing'>{stats.inquiryBreakdown.ongoing}</span>
              <span>Ongoing</span>
            </div>
            <div className='inquiry-stat'>
              <span className='stat-badge done'>{stats.inquiryBreakdown.done}</span>
              <span>Done</span>
            </div>
          </div>
        </div>

        {/* Monthly Inquiries & Products */}
        <div className='chart-card'>
          <h3>Monthly Inquiries & Products Added</h3>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={stats.monthlyAnalytics}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
              <XAxis dataKey='label' tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
              <Legend />
              <Line type='monotone' dataKey='inquiries' stroke='#8b3250' strokeWidth={2} name='Inquiries' />
              <Line type='monotone' dataKey='productsAdded' stroke='#4caf50' strokeWidth={2} name='Products Added' />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Categories */}
        <div className='chart-card'>
          <h3>Products by Category</h3>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={stats.productCategories} layout='vertical'>
              <CartesianGrid strokeDasharray='3 3' stroke='#e0e0e0' />
              <XAxis type='number' tick={{ fontSize: 12 }} />
              <YAxis dataKey='name' type='category' width={100} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} />
              <Bar dataKey='count' fill='#2196f3' name='Products' />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Top Products Table */}
      {stats.topProducts.length > 0 && (
        <div className='top-products-section'>
          <h3>Top 5 Products by Revenue</h3>
          <div className='table-wrap'>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product Name</th>
                  <th>Total Orders</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((product, index) => (
                  <tr key={product.name}>
                    <td><strong>#{index + 1}</strong></td>
                    <td>{product.name}</td>
                    <td>{product.orders}</td>
                    <td><strong>{formatCurrency(product.revenue)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default DashboardPage;
