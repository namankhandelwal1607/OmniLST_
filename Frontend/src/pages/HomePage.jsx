// pages/HomePage.jsx
import React from 'react';
import { GeometricLogo } from '../components/GeometricLogo';
import { HeroSection } from './HeroSection';
import { ProcessSection } from './ProcessSection';
import ETHAnalytics from './ETHAnalytics';
const HomePage = ({state}) => {
  return (
    <>
      <main className="flex px-8 py-12 min-h-[calc(100vh-120px)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-scaleRotate">
            <GeometricLogo />
          </div>
        </div>
        <HeroSection state={state} />

      </main>
      <ETHAnalytics providerMap={state?.provider} />

      <ProcessSection />
    </>
  );
};

export default HomePage;
