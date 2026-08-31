import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ cartCount = 0, onNavigate, currentPage = 'home' }) {
  const { user, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleNavClick = (e, page) => {
    e.preventDefault();
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false); // Close mobile menu when logging out
    logout();
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button onClick={(e) => handleNavClick(e, 'home')} className="flex items-center gap-2">
            <svg className="w-8 h-8 text-fresh-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.19 1 .36 1.56.48l1.12 2.63.99.34 2.24-5.38c.59.07 1.18.1 1.75.1 6.5 0 11.57-3.11 13.16-7.43l-1.74-.96C19.49 10.41 18.75 8 17 8z"/>
            </svg>
            <span className="text-2xl font-bold text-gray-900">NirmalFarm</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={(e) => handleNavClick(e, 'home')}
              className={`font-semibold transition-colors ${
                currentPage === 'home'
                  ? 'text-fresh-green-600'
                  : 'text-gray-700 hover:text-fresh-green-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={(e) => handleNavClick(e, 'shop')}
              className={`font-medium transition-colors ${
                currentPage === 'shop'
                  ? 'text-fresh-green-600'
                  : 'text-gray-700 hover:text-fresh-green-600'
              }`}
            >
              Shop
            </button>
            <button
              onClick={(e) => handleNavClick(e, 'contact')}
              className={`font-medium transition-colors ${
                currentPage === 'contact'
                  ? 'text-fresh-green-600'
                  : 'text-gray-700 hover:text-fresh-green-600'
              }`}
            >
              Contact
            </button>
            {user && (
              <button
                onClick={(e) => handleNavClick(e, 'order-history')}
                className={`font-medium transition-colors ${
                  currentPage === 'order-history'
                    ? 'text-fresh-green-600'
                    : 'text-gray-700 hover:text-fresh-green-600'
                }`}
              >
                Order History
              </button>
            )}
            {isAdmin() && (
              <button
                onClick={(e) => handleNavClick(e, 'admin')}
                className={`font-medium transition-colors ${
                  currentPage === 'admin'
                    ? 'text-fresh-green-600'
                    : 'text-gray-700 hover:text-fresh-green-600'
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Account / User Info */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-700 hover:text-fresh-green-600 transition-colors"
                  title="Logout"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => handleNavClick(e, 'login')}
                className="p-2 text-gray-700 hover:text-fresh-green-600 transition-colors"
                title="Sign in"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}

            {/* Cart Icon */}
            <button 
              onClick={(e) => handleNavClick(e, 'cart')}
              className="relative p-2 text-gray-700 hover:text-fresh-green-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-fresh-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            {/* Cart Icon - Mobile */}
            <button 
              onClick={(e) => handleNavClick(e, 'cart')}
              className="relative p-2 text-gray-700 hover:text-fresh-green-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-fresh-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-700 hover:text-fresh-green-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleMobileMenu}
          />
          
          {/* Mobile Menu Sidebar */}
          <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-white">
                <button onClick={(e) => handleNavClick(e, 'home')} className="flex items-center gap-2">
                  <svg className="w-8 h-8 text-fresh-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.19 1 .36 1.56.48l1.12 2.63.99.34 2.24-5.38c.59.07 1.18.1 1.75.1 6.5 0 11.57-3.11 13.16-7.43l-1.74-.96C19.49 10.41 18.75 8 17 8z"/>
                  </svg>
                  <span className="text-xl font-bold text-gray-900">nirmal farm</span>
                </button>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-700 hover:text-fresh-green-600 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info Section */}
              {user ? (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-fresh-green-600 flex items-center justify-center text-white font-semibold">
                      {user.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">Not logged in</p>
                  <button
                    onClick={(e) => handleNavClick(e, 'login')}
                    className="w-full px-4 py-2 rounded-lg font-medium text-white bg-fresh-green-600 hover:bg-fresh-green-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 p-4 space-y-2">
                <button
                  onClick={(e) => handleNavClick(e, 'home')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    currentPage === 'home'
                      ? 'bg-fresh-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={(e) => handleNavClick(e, 'shop')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    currentPage === 'shop'
                      ? 'bg-fresh-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Shop
                </button>
                <button
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    currentPage === 'contact'
                      ? 'bg-fresh-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Contact
                </button>
                {user && (
                  <button
                    onClick={(e) => handleNavClick(e, 'order-history')}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      currentPage === 'order-history'
                        ? 'bg-fresh-green-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Order History
                  </button>
                )}
                {isAdmin() && (
                  <button
                    onClick={(e) => handleNavClick(e, 'admin')}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      currentPage === 'admin'
                        ? 'bg-fresh-green-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </button>
                )}
              </nav>

              {/* Logout Button */}
              {user && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}