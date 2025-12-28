import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-20 z-40 glass backdrop-blur-md border-t-0 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto py-4 scrollbar-hide gap-2">
          {loading ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 w-32 bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* ALL Button */}
              <button
                onClick={() => onCategoryClick('all')}
                className={`w-32 h-14 flex-shrink-0 px-2 py-2 text-xs font-bold tracking-wider transition-all duration-300 border flex items-center justify-center text-center uppercase font-sans leading-tight ${selectedCategory === 'all'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                  : 'bg-[#121212] text-gray-400 border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                  }`}
              >
                ALL
              </button>

              {/* Category Buttons */}
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`w-32 h-14 flex-shrink-0 px-2 py-2 text-xs font-bold tracking-wider transition-all duration-300 border flex items-center justify-center text-center uppercase font-sans leading-tight ${selectedCategory === c.id
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                    : 'bg-[#121212] text-gray-400 border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                    }`}
                >
                  {c.name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubNav;
