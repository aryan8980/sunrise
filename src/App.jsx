import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import StoreLocatorPage from './pages/StoreLocatorPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AdminLayout from './admin/AdminLayout';
import DashboardPage from './admin/DashboardPage';
import ProductManagementPage from './admin/ProductManagementPage';
import CategoryManagementPage from './admin/CategoryManagementPage';
import InquiryManagementPage from './admin/InquiryManagementPage';
import OrderManagementPage from './admin/OrderManagementPage';
import OwnerClientsPage from './owner/OwnerClientsPage';
import ClientDetailPage from './owner/ClientDetailPage';
import OwnerUserManagementPage from './owner/OwnerUserManagementPage';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<AppShell />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/catalog' element={<CatalogPage />} />
          <Route path='/products/:productId' element={<ProductDetailPage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/stores' element={<StoreLocatorPage />} />
          <Route path='/contact' element={<ContactPage />} />
        </Route>

        <Route path='/admin/login' element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowedRoles={['manager', 'owner']} />}>
            <Route path='/admin' element={<AdminLayout />}>
              <Route index element={<Navigate to='dashboard' replace />} />
              <Route path='dashboard' element={<DashboardPage />} />
              <Route path='products' element={<ProductManagementPage />} />
              <Route path='categories' element={<CategoryManagementPage />} />
              <Route path='inquiries' element={<InquiryManagementPage />} />
              <Route element={<RoleRoute allowedRoles={['owner']} />}>
                <Route path='orders' element={<OrderManagementPage />} />
                <Route path='clients' element={<OwnerClientsPage />} />
                <Route path='clients/:clientId' element={<ClientDetailPage />} />
                <Route path='users' element={<OwnerUserManagementPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path='/owner/*' element={<Navigate to='/admin' replace />} />

        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
