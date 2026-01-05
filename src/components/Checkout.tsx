import React, { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Users } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onOrderComplete: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack, onOrderComplete }) => {
  const { paymentMethods } = usePaymentMethods();
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('dine-in');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [dineInTime, setDineInTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messengerUrl, setMessengerUrl] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [orderDetailsText, setOrderDetailsText] = useState('');

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  React.useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);

    const timeInfo = serviceType === 'pickup'
      ? (pickupTime === 'custom' ? customTime : `${pickupTime} minutes`)
      : '';

    const dineInInfo = serviceType === 'dine-in'
      ? `👥 Party Size: ${partySize} person${partySize !== 1 ? 's' : ''}\n🕐 Preferred Time: ${new Date(dineInTime).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`
      : '';

    // Save order to database
    try {
      const preferredTime = serviceType === 'dine-in'
        ? dineInTime
        : serviceType === 'pickup'
          ? timeInfo
          : undefined;

      // Insert order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: customerName,
          contact_number: contactNumber,
          service_type: serviceType,
          address: serviceType === 'delivery' ? address : null,
          landmark: serviceType === 'delivery' ? landmark : null,
          party_size: serviceType === 'dine-in' ? partySize : null,
          preferred_time: preferredTime,
          payment_method: selectedPaymentMethod?.name || paymentMethod,
          notes: notes || null,
          total: totalPrice,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Error saving order:', orderError);
      } else if (newOrder) {
        // Insert order items
        const orderItems = cartItems.map(item => ({
          order_id: newOrder.id,
          item_name: item.name,
          variation_name: item.selectedVariation ? `[${item.selectedVariation.code || ''}] ${item.selectedVariation.name}` : null,
          add_ons: item.selectedAddOns?.map(a => ({ name: a.name, quantity: a.quantity || 1 })) || [],
          quantity: item.quantity,
          unit_price: item.totalPrice,
          total_price: item.totalPrice * item.quantity
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Error saving order items:', itemsError);
        }
      }
    } catch (err) {
      console.error('Error saving order to database:', err);
      // Continue with Messenger even if database save fails
    }

    const orderDetails = `
🛒 Daniel's ORDER

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}
📍 Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `🏠 Address: ${address}${landmark ? `\n🗺️ Landmark: ${landmark}` : ''}` : ''}
${serviceType === 'pickup' ? `⏰ Pickup Time: ${timeInfo}` : ''}
${serviceType === 'dine-in' ? dineInInfo : ''}

📋 ORDER DETAILS:
${cartItems.map(item => {
      let itemDetails = `• ${item.name}`;
      if (item.selectedVariation) {
        itemDetails += ` (${item.selectedVariation.name})`;
      }
      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        itemDetails += ` + ${item.selectedAddOns.map(addOn =>
          addOn.quantity && addOn.quantity > 1
            ? `${addOn.name} x${addOn.quantity}`
            : addOn.name
        ).join(', ')}`;
      }
      itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
      return itemDetails;
    }).join('\n')}

💰 TOTAL: ₱${totalPrice}
${serviceType === 'delivery' ? `🛵 DELIVERY FEE:` : ''}

💳 Payment: ${selectedPaymentMethod?.name || paymentMethod}
📸 Payment Screenshot: Please attach your payment receipt screenshot

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this order to proceed. Thank you for choosing Daniel's! ☕
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    // Detect if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Robust clipboard copy function with proper fallback chain
    const copyToClipboard = async (text: string): Promise<'success' | 'prompt' | 'failed'> => {
      // Try 1: Modern Clipboard API (if available and secure context)
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return 'success';
        } catch (err) {
          console.error('Clipboard API failed:', err);
          // Fall through to execCommand fallback
        }
      }

      // Try 2: execCommand fallback (works on more browsers/contexts)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          return 'success';
        }
      } catch (err) {
        console.error('execCommand fallback failed:', err);
      }

      // Try 3: Manual prompt fallback (always works)
      window.prompt("Copy your order details manually: (Ctrl+C / Long Press)", text);
      return 'prompt';
    };

    // EXECUTION LOGIC:
    const copyResult = await copyToClipboard(orderDetails);

    // Clear cookies and storage before redirect
    const clearBrowserData = () => {
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
    };

    if (isMobile) {
      // MOBILE STRATEGY: 
      // Use m.me with text parameter for AUTO-FILL on mobile Messenger
      // This is the only URL that supports pre-filling messages on mobile
      setMessengerUrl(`https://m.me/DanielsSLK?text=${encodedMessage}`);
      setFallbackUrl(`fb-messenger://user-thread/111896790519879`);
      setOrderDetailsText(orderDetails);
      setStep('confirmation');
    } else {
      // DESKTOP STRATEGY:
      // messenger.com supports pre-fill text reliably.
      clearBrowserData();
      window.location.href = `https://www.messenger.com/t/DanielsSLK?text=${encodedMessage}`;
    }
  };

  const isDetailsValid = customerName && contactNumber &&
    (serviceType !== 'delivery' || address) &&
    (serviceType !== 'pickup' || (pickupTime !== 'custom' || customTime));


  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center mb-12">
        <button
          onClick={step === 'payment' ? () => setStep('details') : onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span className="uppercase tracking-wider text-sm">{step === 'payment' ? 'Back to Details' : 'Back to Cart'}</span>
        </button>
        <h1 className="text-4xl font-script text-white text-shadow-sm ml-8">{step === 'details' ? 'Order Details' : 'Payment'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-7 space-y-8">
          {step === 'details' ? (
            <div className="space-y-8">
              {/* Customer Information */}
              <div className="card-premium p-8">
                <h2 className="text-xl font-light text-white uppercase tracking-widest mb-8 flex items-center">
                  <span className="w-8 h-px bg-white/30 mr-4"></span>
                  Information
                </h2>
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-white transition-colors">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-white transition-colors">Contact Number *</label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setContactNumber(value);
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                      placeholder="09XX XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Service Type */}
              <div className="card-premium p-8">
                <h2 className="text-xl font-light text-white uppercase tracking-widest mb-8 flex items-center">
                  <span className="w-8 h-px bg-white/30 mr-4"></span>
                  Service Method
                </h2>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { value: 'dine-in', label: 'Dine In', icon: <Users className="w-5 h-5" /> },
                    { value: 'pickup', label: 'Pickup', icon: <Clock className="w-5 h-5" /> },
                    { value: 'delivery', label: 'Delivery', icon: <MapPin className="w-5 h-5" /> }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-3 relative overflow-hidden group ${serviceType === option.value
                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                        : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {option.icon}
                      <span className="text-xs font-bold uppercase tracking-wider">{option.label}</span>
                      {serviceType === option.value && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-white opacity-20" />
                      )}
                    </button>
                  ))}
                </div>


                {serviceType === 'pickup' && (
                  <div className="space-y-6 animate-fade-in pl-4 border-l border-white/10">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Pickup Time</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '5-10', label: '5-10 mins' },
                        { value: '15-20', label: '15-20 mins' },
                        { value: '25-30', label: '25-30 mins' },
                        { value: 'custom', label: 'Custom' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPickupTime(option.value)}
                          className={`p-3 text-sm border transition-all duration-300 ${pickupTime === option.value
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {pickupTime === 'custom' && (
                      <div className="group">
                        <input
                          type="text"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                          placeholder="e.g., 45 minutes, 1 hour, 2:30 PM"
                        />
                      </div>
                    )}
                  </div>
                )}

                {serviceType === 'delivery' && (
                  <div className="space-y-6 animate-fade-in pl-4 border-l border-white/10">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address *</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                        placeholder="Enter your complete delivery address"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="group">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-hover:text-white transition-colors">Landmark</label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                        placeholder="e.g., Near McDonald's"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="card-premium p-8">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg ${isDetailsValid
                  ? 'bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.01]'
                  : 'bg-neutral-800 text-gray-500 cursor-not-allowed border border-white/5'
                  }`}
              >
                Proceed to Payment
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-slide-up">
              <div className="card-premium p-8">
                <h2 className="text-xl font-light text-white uppercase tracking-widest mb-8 flex items-center">
                  <span className="w-8 h-px bg-white/30 mr-4"></span>
                  Payment Method
                </h2>

                <div className="grid grid-cols-1 gap-4 mb-8">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={`p-6 border transition-all duration-300 flex items-center space-x-6 group ${paymentMethod === method.id
                        ? 'bg-white/10 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                        : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:bg-white/5'
                        }`}
                    >
                      <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">💳</span>
                      <div className="text-left">
                        <div className={`font-bold uppercase tracking-wider text-sm ${paymentMethod === method.id ? 'text-white' : 'text-gray-300'}`}>{method.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Scan QR code to pay</div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedPaymentMethod && (
                  <div className="bg-neutral-900 border border-white/10 p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>

                    <div className="flex-1 space-y-2 relative z-10">
                      <p className="text-xs text-gray-500 uppercase tracking-widest">Account Details</p>
                      <p className="font-mono text-xl text-white tracking-wider">{selectedPaymentMethod.account_number}</p>
                      <p className="text-sm text-gray-400">{selectedPaymentMethod.account_name}</p>
                      <div className="pt-4 mt-4 border-t border-white/5">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-white">₱{totalPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 relative group">
                      <div className="absolute inset-0 bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img
                        src={selectedPaymentMethod.qr_code_url}
                        alt="QR Code"
                        className="w-40 h-40 border border-white/20 p-2 bg-white relative z-10"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 p-4 flex items-start space-x-3">
                <span className="text-xl">📸</span>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide mb-1">Payment Proof Required</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    After making your payment, please take a screenshot of your receipt. You will need to attach it when confirming your order via Messenger.
                  </p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className={`w-full py-4 font-bold text-lg uppercase tracking-[0.15em] transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] ${isSubmitting ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] hover:scale-[1.01]'}`}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order via Messenger'}
              </button>
            </div>
          ) : step === 'confirmation' ? (
          <div className="space-y-8 animate-slide-up">
            <div className="card-premium p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Order Submitted!</h2>
              <p className="text-gray-400 mb-8">Your order has been saved. Please complete it by sending the details via Messenger.</p>

              {/* Primary Button - Auto-fill */}
              <a
                href={messengerUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="block w-full py-4 bg-blue-600 text-white font-bold text-lg uppercase tracking-wide mb-4 hover:bg-blue-700 transition-all text-center"
              >
                📱 Open Messenger (Auto-fill)
              </a>

              <p className="text-xs text-gray-500 mb-6">Your order details will be pre-filled in Messenger</p>

              {/* Fallback Section */}
              <div className="border-t border-white/10 pt-6 mt-6">
                <p className="text-sm text-gray-400 mb-4">Having trouble? Try the alternative link:</p>
                <a
                  href={fallbackUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="block w-full py-3 bg-transparent border border-white/30 text-white font-medium uppercase tracking-wide hover:bg-white/10 transition-all text-center text-sm"
                >
                  🔄 Alternative Link (Paste Required)
                </a>
                <p className="text-xs text-gray-500 mt-3">This opens Messenger directly. You'll need to paste your order (already copied to clipboard).</p>
              </div>
            </div>

            {/* Order Reference */}
            <div className="card-premium p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Your Order Details (Backup)</h3>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-black/30 p-4 rounded max-h-48 overflow-y-auto">{orderDetailsText}</pre>
            </div>
          </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 card-premium p-8">
            <h2 className="text-xl font-light text-white uppercase tracking-widest mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors p-2 -mx-2 rounded-sm">
                  <div className="flex-1 pr-4">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium text-white text-sm">{item.name}</h4>
                      <span className="text-white text-sm">₱{(item.totalPrice * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>x{item.quantity} {item.selectedVariation && `• ${item.selectedVariation.name}`}</span>
                      <span>₱{item.totalPrice.toFixed(2)} ea</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>₱{totalPrice.toFixed(2)}</span>
              </div>
              {serviceType === 'delivery' && (
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Delivery Fee</span>
                  <span className="text-xs uppercase border border-white/10 px-2 py-0.5 rounded-sm">Calculated on Messenger</span>
                </div>
              )}
              <div className="flex justify-between text-white text-xl font-bold mt-4 pt-4 border-t border-white/10">
                <span>Total</span>
                <span>₱{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;