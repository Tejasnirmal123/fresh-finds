import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { setNavigationHandler, getCart } from './services/api';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Categories from './components/Categories';
import SeasonalFavorites from './components/SeasonalFavorites';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState(null); // Store data for pages
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    // Redirect to home if already authenticated and on login/signup pages
    if (!loading && isAuthenticated() && (currentPage === 'login' || currentPage === 'signup')) {
      setCurrentPage('home');
    }
  }, [loading, isAuthenticated, currentPage]);

  const handleNavigation = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
  };

  // Set navigation handler for API calls (for 401 redirects)
  useEffect(() => {
    setNavigationHandler(handleNavigation);
  }, []);

  // Fetch cart count - only when needed, not continuously
  const fetchCartCount = React.useCallback(async () => {
    if (isAuthenticated() && user) {
      try {
        const cartData = await getCart();
        setCartCount(cartData.itemCount || 0);
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated, user]);

  // Fetch cart count only when user logs in or authentication state changes
  useEffect(() => {
    if (!loading) {
      fetchCartCount();
    }
  }, [loading, isAuthenticated, user, fetchCartCount]);

  // Show login/signup/order-success pages without header/footer
  if (currentPage === 'login' || currentPage === 'signup') {
    return currentPage === 'login' ? (
      <Login onNavigate={handleNavigation} />
    ) : (
      <Signup onNavigate={handleNavigation} />
    );
  }

  if (currentPage === 'order-success') {
    console.log('Rendering OrderSuccess page with pageData:', pageData);
    return (
      <ProtectedRoute onNavigate={handleNavigation}>
        <OrderSuccess orderData={pageData?.orderData || pageData} onNavigate={handleNavigation} />
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={cartCount} onNavigate={handleNavigation} currentPage={currentPage} />
      <main className="flex-grow">
        {currentPage === 'home' ? (
          <>
            <Hero onNavigate={handleNavigation} />
            <Features />
            <Categories />
            <SeasonalFavorites onNavigate={handleNavigation} />
            <Testimonials />
          </>
        ) : currentPage === 'shop' ? (
          <Shop onCartUpdate={fetchCartCount} />
        ) : currentPage === 'contact' ? (
          <Contact />
        ) : currentPage === 'cart' ? (
          <ProtectedRoute onNavigate={handleNavigation}>
            <Cart onCartUpdate={fetchCartCount} onNavigate={handleNavigation} />
          </ProtectedRoute>
        ) : currentPage === 'checkout' ? (
          <ProtectedRoute onNavigate={handleNavigation}>
            <Checkout onNavigate={handleNavigation} onCartUpdate={fetchCartCount} />
          </ProtectedRoute>
        ) : currentPage === 'order-history' ? (
          <ProtectedRoute onNavigate={handleNavigation}>
            <OrderHistory onNavigate={handleNavigation} />
          </ProtectedRoute>
        ) : currentPage === 'admin' ? (
          <ProtectedRoute requireAdmin={true} onNavigate={handleNavigation}>
            <Admin />
          </ProtectedRoute>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}