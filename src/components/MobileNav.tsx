import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface MobileNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeCategory, onCategoryClick }) => {
  const { categories } = useCategories();

  return (
    <div className="sticky top-20 z-40 glass md:hidden">
      <div className="relative">
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-3 pb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className={`flex-shrink-0 min-w-[140px] flex items-center justify-center px-4 py-3 mr-3 transition-all duration-300 border whitespace-nowrap font-sans font-bold text-sm tracking-wider uppercase ${activeCategory === category.id
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg'
                : 'bg-[#121212] text-gray-400 border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
            >
              {/* Removed generic emoji icon */}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
        {/* Scroll gradients */}
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/50 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default MobileNav;