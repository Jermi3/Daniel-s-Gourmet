import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center py-20 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="text-[200px] font-script">Cart</div>
          </div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="text-7xl mb-6 opacity-30">☕</div>
            <h2 className="text-3xl font-sans font-light text-white mb-4 tracking-wide">Your cart is empty</h2>
            <p className="text-gray-400 mb-8 font-light">Add some delicious items to get started!</p>
            <button
              onClick={onContinueShopping}
              className="bg-white text-black px-8 py-3 uppercase tracking-widest text-sm font-bold hover:bg-gray-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105"
            >
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase tracking-wider text-sm">Continue Shopping</span>
        </button>
        <h1 className="text-4xl font-script text-white text-shadow-sm">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-gray-500 hover:text-white transition-colors duration-300 text-sm uppercase tracking-wider"
        >
          Clear All
        </button>
      </div>

      <div className="bg-card-gradient card-premium p-1 mb-8">
        <div className="bg-black/40 backdrop-blur-sm divide-y divide-white/5">
          {cartItems.map((item) => (
            <div key={item.id} className="p-6 hover:bg-white/5 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-6">
                  <h3 className="text-lg font-medium text-white mb-2 tracking-wide">{item.name}</h3>
                  {item.selectedVariation && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs uppercase tracking-wider text-gray-500 border border-white/10 px-1.5 py-0.5">Size</span>
                      <span className="text-sm text-gray-400">{item.selectedVariation.name}</span>
                    </div>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.selectedAddOns.map((addOn, idx) => (
                        <span key={idx} className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-sm border border-white/5">
                          {addOn.quantity && addOn.quantity > 1
                            ? `${addOn.name} x${addOn.quantity}`
                            : addOn.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-lg font-bold text-white mt-3">₱{item.totalPrice.toFixed(2)}</p>
                </div>

                <div className="flex flex-col items-end space-y-4">
                  <div className="flex items-center bg-black border border-white/20 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-white/10 text-white transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-white min-w-[32px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-white/10 text-white transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-6">
                    <p className="text-xl font-bold text-white">₱{(item.totalPrice * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-600 hover:text-white transition-colors duration-300"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card-gradient card-premium p-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <span className="text-xl font-light text-gray-400 uppercase tracking-widest">Total Amount</span>
          <span className="text-4xl font-bold text-white font-sans text-shadow-md">₱{parseFloat(getTotalPrice()?.toString() || '0').toFixed(2)}</span>
        </div>

        <button
          onClick={onCheckout}
          className="w-full bg-white text-black py-4 font-bold text-lg uppercase tracking-[0.15em] hover:bg-gray-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] hover:scale-[1.01] relative z-10"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;