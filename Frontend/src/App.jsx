import React from 'react';
import { Header } from './components/Header';
import { GeometricLogo } from './components/GeometricLogo';
import { HeroSection } from './pages/HeroSection';
import {ProcessSection} from './pages/ProcessSection';
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 relative overflow-hidden">
      <Header />

      <main className="flex px-8 py-12 min-h-[calc(100vh-120px)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-scaleRotate">
            <GeometricLogo />
          </div>
        </div>


        <HeroSection />
      </main>
      <ProcessSection />
    </div>
  );
}

export default App;