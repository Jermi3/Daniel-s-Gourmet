import React, { useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  quantity,
  onUpdateQuantity
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);

  const calculatePrice = () => {
    // Use effective price (discounted or regular) as base
    let price = item.effectivePrice || item.basePrice;
    if (selectedVariation) {
      // Variation price REPLACES base price, not adds to it
      price = selectedVariation.price;
    }
    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price;
  };

  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowCustomization(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn =>
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    onAddToCart(item, 1, selectedVariation, addOnsForCart);
    setShowCustomization(false);
    setSelectedAddOns([]);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);

      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }

      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>
      <div className={`group relative flex flex-col overflow-hidden transition-all duration-300 card-premium ${!item.available ? 'opacity-60' : ''}`}>

        {/* Image Container */}
        <div className="relative h-64 overflow-hidden z-10 bg-placeholder-pattern">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
            <div className="w-16 h-16 rounded-full border border-[rgba(212,175,55,0.3)] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <span className="text-2xl text-[#D4AF37] opacity-40">🍴</span>
            </div>
          </div>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90 z-20"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-30">
            {item.isOnDiscount && item.discountPrice && (
              <div className="bg-[#D4AF37] text-black text-xs font-bold px-3 py-1.5 shadow-lg tracking-wider uppercase">
                Sale
              </div>
            )}
            {item.popular && (
              <div className="bg-black/60 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-bold px-3 py-1.5 shadow-lg tracking-wider uppercase">
                Popular
              </div>
            )}
          </div>

          {!item.available && (
            <div className="absolute top-3 right-3 bg-neutral-900/90 text-white border border-white/20 text-xs font-bold px-3 py-1.5 tracking-wider backdrop-blur-sm uppercase">
              Unavailable
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 pt-2 relative z-10 flex-1 flex flex-col bg-transparent">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-xl font-serif text-[#FAFAFA] leading-tight flex-1 pr-2 tracking-wide group-hover:text-[#D4AF37] transition-colors duration-300">{item.name}</h4>
          </div>

          <p className={`text-sm mb-6 leading-relaxed flex-1 font-sans font-light ${!item.available ? 'text-gray-500' : 'text-gray-400'}`}>
            {!item.available ? 'Currently Unavailable' : item.description}
          </p>

          {/* Sizes Tag */}
          {item.variations && item.variations.length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-wider text-[#C5A572] border border-[#C5A572]/20 px-2 py-1 rounded-sm">
                {item.variations.length} Options
              </span>
            </div>
          )}

          {/* Pricing & Actions */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 relative">

            <div className="flex-1">
              {item.isOnDiscount && item.discountPrice ? (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-[#D4AF37] tracking-tight font-sans">
                      ₱{item.discountPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-600 line-through font-sans">
                      ₱{item.basePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xl font-bold text-[#D4AF37] tracking-tight font-sans">
                  ₱{item.basePrice.toFixed(2)}
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              {!item.available ? (
                <button disabled className="text-gray-600 text-sm font-medium cursor-not-allowed uppercase tracking-wider">
                  Sold Out
                </button>
              ) : quantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="group/btn relative overflow-hidden bg-[#D4AF37] text-black px-6 py-2.5 transition-all duration-300 font-bold text-sm uppercase tracking-wide shadow-lg hover:bg-[#C5A572] hover:scale-105"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>{item.variations?.length || item.addOns?.length ? 'Customize' : 'Add'}</span>
                    {!item.variations?.length && !item.addOns?.length && <Plus className="w-4 h-4" />}
                  </span>
                </button>
              ) : (
                <div className="flex items-center bg-black border border-[#D4AF37]/30 p-1">
                  <button
                    onClick={handleDecrement}
                    className="p-1.5 hover:bg-white/10 text-[#D4AF37] transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-bold text-white min-w-[24px] text-center text-sm">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-1.5 hover:bg-white/10 text-[#D4AF37] transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity" onClick={() => setShowCustomization(false)} />

          <div className="relative w-full max-w-lg glass-modal animate-scale-in max-h-[90vh] overflow-y-auto flex flex-col border border-[#D4AF37]/20">
            <div className="sticky top-0 z-10 border-b border-white/10 bg-[#121212]/95 backdrop-blur-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-serif text-[#FAFAFA] tracking-wide">Customize {item.name}</h3>
                <div className="h-0.5 w-12 bg-[#D4AF37] mt-2"></div>
              </div>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-8 bg-[#121212]">
              {/* Size Variations */}
              {item.variations && item.variations.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-4 font-sans">Choose Size</h4>
                  <div className="space-y-3">
                    {item.variations.map((variation) => (
                      <label
                        key={variation.id}
                        className={`group cursor-pointer block relative transition-all duration-300`}
                      >
                        <input
                          type="radio"
                          name="variation"
                          checked={selectedVariation?.id === variation.id}
                          onChange={() => setSelectedVariation(variation)}
                          className="peer sr-only"
                        />
                        <div className="flex items-center justify-between p-4 border border-white/10 bg-white/5 hover:bg-white/10 peer-checked:bg-[#D4AF37] peer-checked:border-[#D4AF37] peer-checked:text-black transition-all duration-300">
                          <span className="font-medium group-hover:translate-x-1 transition-transform font-sans">
                            {variation.name}
                            {variation.code && <span className="text-xs text-gray-500 ml-2">[{variation.code}]</span>}
                          </span>
                          <span className="font-bold font-sans">
                            ₱{variation.price.toFixed(2)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-4 font-sans">Enhance Your Meal</h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h5 className="text-xs font-semibold text-gray-500 mb-3 capitalize px-1 flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full mr-2"></span>
                        {category.replace('-', ' ')}
                      </h5>
                      <div className="grid grid-cols-1 gap-3">
                        {addOns.map((addOn) => (
                          <div
                            key={addOn.id}
                            className="flex items-center justify-between p-3 border border-dashed border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/5 transition-all duration-300 group"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-white group-hover:text-[#D4AF37] transition-all font-sans">{addOn.name}</span>
                              <div className="text-xs text-gray-400 mt-0.5 font-sans">
                                {addOn.price > 0 ? `+₱${addOn.price.toFixed(2)}` : 'Free'}
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              {selectedAddOns.find(a => a.id === addOn.id) ? (
                                <div className="flex items-center bg-[#D4AF37] border border-[#D4AF37] p-0.5 shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                    }}
                                    className="p-1 hover:bg-white/20 text-black transition-colors"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="font-bold text-black min-w-[20px] text-center text-xs font-sans">
                                    {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                    }}
                                    className="p-1 hover:bg-white/20 text-black transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn, 1)}
                                  className="w-8 h-8 flex items-center justify-center border border-white/20 text-white hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-all duration-300"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Summary & Action */}
            <div className="sticky bottom-0 bg-[#121212] border-t border-white/10 p-6 z-10">
              <div className="flex items-center justify-between text-white mb-6">
                <span className="text-sm font-light uppercase tracking-widest text-gray-400 font-sans">Total Amount</span>
                <span className="text-2xl font-bold font-sans text-[#D4AF37]">₱{calculatePrice().toFixed(2)}</span>
              </div>

              <button
                onClick={handleCustomizedAddToCart}
                className="w-full bg-[#D4AF37] text-black py-4 font-bold text-sm uppercase tracking-[0.1em] hover:bg-[#C5A572] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.02] flex items-center justify-center space-x-3"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItemCard;