import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  itemCount: number;
  onCartClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ itemCount, onCartClick }) => {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onCartClick}
      className="fixed bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-110 transition-all duration-300 z-50 md:hidden group border border-gray-200"
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-white blur-md rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>

        <ShoppingCart className="h-6 w-6 relative z-10" />

        <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold border border-white animate-bounce-gentle relative z-20">
          {itemCount}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;