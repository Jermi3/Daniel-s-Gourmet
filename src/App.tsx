import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import Header from './components/Header';
import SubNav from './components/SubNav';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import { useMenu } from './hooks/useMenu';

function MainApp() {
  const cart = useCart();
  const { menuItems } = useMenu();
  const [currentView, setCurrentView] = React.useState<'menu' | 'cart' | 'checkout'>('menu');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const handleViewChange = (view: 'menu' | 'cart' | 'checkout') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-pattern font-inter text-white selection:bg-white selection:text-black">
      <Header
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={() => handleViewChange('menu')}
        selectedCategory={selectedCategory}
        onCategoryClick={handleCategoryClick}
        showNav={currentView === 'menu'}
      />

      {/* Desktop SubNav - Hidden when scrolled since Header shows nav */}
      {currentView === 'menu' && (
        <div className="hidden md:block">
          <SubNav selectedCategory={selectedCategory} onCategoryClick={handleCategoryClick} />
        </div>
      )}

      <div className="animate-fade-in">
        {currentView === 'menu' && (
          <Menu
            menuItems={filteredMenuItems}
            addToCart={cart.addToCart}
            cartItems={cart.cartItems}
            updateQuantity={cart.updateQuantity}
          />
        )}

        {currentView === 'cart' && (
          <Cart
            cartItems={cart.cartItems}
            updateQuantity={cart.updateQuantity}
            removeFromCart={cart.removeFromCart}
            clearCart={cart.clearCart}
            getTotalPrice={cart.getTotalPrice}
            onContinueShopping={() => handleViewChange('menu')}
            onCheckout={() => handleViewChange('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <Checkout
            cartItems={cart.cartItems}
            totalPrice={cart.getTotalPrice()}
            onBack={() => handleViewChange('cart')}
            onOrderComplete={() => {
              cart.clearCart();
              handleViewChange('menu');
            }}
          />
        )}
      </div>

      {currentView === 'menu' && (
        <FloatingCartButton
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;