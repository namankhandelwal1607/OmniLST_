// pages/HomePage.jsx
import React from 'react';
import { GeometricLogo } from '../components/GeometricLogo';
import { HeroSection } from './HeroSection';
import { ProcessSection } from './ProcessSection';

const HomePage = () => {
  return (
    <>
      <main className="flex px-8 py-12 min-h-[calc(100vh-120px)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-scaleRotate">
            <GeometricLogo />
          </div>
        </div>
        <HeroSection />
      </main>
      <ProcessSection />
    </>
  );
};

export default HomePage;
