import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { MobileBottomBar } from './MobileBottomBar';
import { FlipkartCartDrawer } from '../shop/FlipkartCartDrawer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-light text-brand-text">
      <PublicNavbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <PublicFooter />
      <MobileBottomBar />
      <FlipkartCartDrawer />
    </div>
  );
};
