import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
  selectedCategory?: string;
  onCategoryClick?: (categoryId: string) => void;
  showNav?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  cartItemsCount,
  onCartClick,
  onMenuClick,
  selectedCategory = 'all',
  onCategoryClick,
  showNav = false
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { categories } = useCategories();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-14' : 'h-20'}`}>
          <button
            onClick={onMenuClick}
            className="flex items-center space-x-3 text-white hover:opacity-80 transition-all duration-300 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-md rounded-full scale-0 group-hover:scale-125 transition-transform duration-500"></div>
              <img
                src="/daniels-logo.jpg"
                alt="Daniel's"
                className={`relative rounded-full object-cover ring-1 ring-white/20 group-hover:ring-white/50 transition-all duration-300 ${isScrolled ? 'w-9 h-9' : 'w-12 h-12'}`}
              />
            </div>
            <h1 className={`font-script text-white transform translate-y-1 text-shadow-sm group-hover:text-shadow-md transition-all duration-300 ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>
              Daniel's
            </h1>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onCartClick}
              className="relative p-2.5 text-white hover:bg-white/5 rounded-full transition-all duration-200 group border border-transparent hover:border-white/10"
            >
              <ShoppingCart className="h-6 w-6 text-gray-200 group-hover:text-white transition-colors" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle shadow-lg ring-2 ring-black">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation - Slides in when scrolled */}
      {showNav && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-white/5 ${isScrolled ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto py-2 scrollbar-hide gap-2">
              {/* ALL Button */}
              <button
                onClick={() => onCategoryClick?.('all')}
                className={`flex-shrink-0 px-4 py-2 text-xs font-bold tracking-wider transition-all duration-300 border uppercase ${selectedCategory === 'all'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-transparent text-gray-400 border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                  }`}
              >
                ALL
              </button>

              {/* Category Buttons */}
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick?.(c.id)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-bold tracking-wider transition-all duration-300 border uppercase whitespace-nowrap ${selectedCategory === c.id
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtle bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </header>
  );
};

export default Header;