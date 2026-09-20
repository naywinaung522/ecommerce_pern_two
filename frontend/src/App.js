// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import Home from './components/layout/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductList from './components/products/ProductList';
import ProductDetails from './components/products/ProductDetails';
import Cart from './components/cart/Cart';
import OrderCheckout from './components/orders/OrderCheckout';
import OrderSuccess from './components/orders/OrderSuccess';
import UserDashboard from './components/user/UserDashboard';
import UserProfile from './components/user/UserProfile'; // Add this import
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProducts from './components/admin/AdminProducts';
import AdminOrders from './components/admin/AdminOrders';
import AdminUsers from './components/admin/AdminUsers';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import About from './components/pages/About';
import OrderDetail from './components/orders/OrderDetail';
import RecycleBin from './components/orders/RecycleBin';

import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />

              <Route path="/checkout" element={
                <PrivateRoute>
                  <OrderCheckout />
                </PrivateRoute>
              } />
              <Route path="/order-success" element={
                <PrivateRoute>
                  <OrderSuccess />
                </PrivateRoute>
              } />

              <Route path="/dashboard" element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              } />

              {/* Add Profile Route */}
              <Route path="/profile" element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              } />

              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/products" element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } />

              // Add this route
              <Route path="/order/:id" element={
                <PrivateRoute>
                  <OrderDetail />
                </PrivateRoute>
              } />

              <Route path="/recycle-bin" element={
                <PrivateRoute>
                  <RecycleBin />
                </PrivateRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
          <ToastContainer position="bottom-right" />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;