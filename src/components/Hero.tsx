import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-daniels-dark py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
      <div className="relative max-w-4xl mx-auto text-center z-10">
        <h1 className="text-6xl md:text-8xl font-script text-white mb-6 animate-fade-in tracking-wide">
          Daniel's
          <span className="block text-xl md:text-2xl font-sans font-light tracking-[0.2em] mt-4 text-daniels-light uppercase">
            Home of Gourmet Pasta Salad Sandwich Coffee
          </span>
        </h1>
        <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto animate-slide-up font-light">
          Experience the perfect blend of artisanal flavors and cozy atmosphere.
        </p>
        <div className="flex justify-center">
          <a
            href="#menu"
            className="bg-white text-daniels-dark border border-white px-10 py-3 rounded-none hover:bg-transparent hover:text-white transition-all duration-300 font-sans font-medium tracking-widest uppercase text-sm"
          >
            View Menu
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;