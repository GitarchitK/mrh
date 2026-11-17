import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Smartphone,
  Phone,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Search,
  Sparkles,
  ShoppingCart,
  ShoppingBag,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { createWhatsAppUrl } from '../../lib/whatsapp';

export const PublicNavbar: React.FC = () => {
  const { settings, enabledServices } = useSettings();
  const { openCart, totalItems } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks: Array<{ name: string; path: string; icon?: React.ElementType; badge?: string }> = [
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/shop' },
    { name: 'All Repair Services', path: '/services' },
    { name: 'Android Repair', path: '/android-repair' },
    { name: 'iPhone Repair', path: '/iphone-repair' },
    { name: 'Accessories', path: '/accessories' },
    { name: 'Track Status', path: '/repair-status', icon: Search },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="w-full z-40">
      {/* 5.1 Announcement Bar */}
      {settings.noticeBarActive && (
        <div className="bg-gradient-to-r from-brand-navy-dark via-brand-navy to-brand-navy-dark text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 border-b border-white/10 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 font-medium tracking-wide min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange" />
              </span>
              <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span className="truncate">{settings.noticeBarText}</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] shrink-0 font-medium">
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 hover:text-brand-orange transition-colors"
              >
                <Phone className="w-3 h-3 text-brand-orange" />
                <span>{settings.phone}</span>
              </a>
              <span className="text-white/30">|</span>
              <a
                href={createWhatsAppUrl('Hello Debasish, I need assistance with a mobile phone repair.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-emerald-300 text-emerald-400 transition-colors"
              >
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                <span>WhatsApp Debasish</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Glass Navigation Bar */}
      <div className="sticky top-0 z-40 glass-nav border-b border-brand-border/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 xl:gap-4">
            {/* Brand Logo & Wordmark */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group focus:outline-none min-w-0 shrink-0">
              <div className="relative shrink-0 group-hover:scale-105 transition-all duration-300">
                <img
                  src="/images/logo.webp"
                  alt="Mobile Repairing House Logo"
                  className="w-9 h-9 sm:w-10 sm:h-10 xl:w-11 xl:h-11 rounded-xl sm:rounded-2xl object-contain shadow-xs border border-brand-border/60 bg-white p-0.5"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm sm:text-base lg:text-[15px] xl:text-lg font-black text-brand-navy tracking-tight group-hover:text-brand-orange transition-colors duration-200 truncate leading-tight">
                  Mobile Repairing House
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-brand-secondary tracking-wider uppercase flex items-center gap-1 truncate mt-0.5">
                  <span className="truncate">Dunlop, Kolkata</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-emerald-700 font-semibold truncate hidden xs:inline">Open For Repairs</span>
                  <span className="text-emerald-700 font-semibold truncate xs:hidden">Open</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink min-w-0">
              <Link
                to="/"
                className={cn(
                  'px-2 xl:px-3 py-1.5 xl:py-2 text-[11px] xl:text-xs font-semibold rounded-xl transition-all duration-200 relative whitespace-nowrap shrink-0',
                  isActive('/') && location.pathname === '/'
                    ? 'text-brand-orange bg-brand-orange-light/50 font-bold'
                    : 'text-brand-navy hover:text-brand-orange hover:bg-brand-light/80'
                )}
              >
                Home
              </Link>

              {/* Store Link */}
              <Link
                to="/shop"
                className={cn(
                  'px-2 xl:px-3 py-1.5 xl:py-2 text-[11px] xl:text-xs font-semibold rounded-xl transition-all duration-200 inline-flex items-center gap-1 xl:gap-1.5 relative group whitespace-nowrap shrink-0',
                  isActive('/shop')
                    ? 'text-[#2874f0] bg-blue-50 font-bold border border-blue-200 shadow-2xs'
                    : 'text-brand-navy hover:text-[#2874f0] hover:bg-blue-50/60'
                )}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#2874f0] shrink-0" />
                <span>Store</span>
              </Link>

              {/* Services Animated Dropdown */}
              <div
                className="relative shrink-0"
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onMouseLeave={() => setServicesDropdownOpen(false)}
              >
                <button
                  className={cn(
                    'px-2 xl:px-3 py-1.5 xl:py-2 text-[11px] xl:text-xs font-semibold rounded-xl transition-all duration-200 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap',
                    isActive('/services')
                      ? 'text-brand-orange bg-brand-orange-light/50 font-bold'
                      : 'text-brand-navy hover:text-brand-orange hover:bg-brand-light/80'
                  )}
                >
                  <span>Services</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200 shrink-0', servicesDropdownOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {servicesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute top-full left-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-brand-border/90 py-2.5 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-brand-border/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
                          Repair Specializations ({enabledServices.length})
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                      </div>
                      <div className="max-h-80 overflow-y-auto py-1 px-1.5">
                        {enabledServices.map((srv) => (
                          <Link
                            key={srv.id}
                            to={`/services/${srv.slug}`}
                            className="block px-3 py-2 rounded-xl text-xs text-brand-text hover:bg-brand-light hover:text-brand-orange transition-all duration-150"
                            onClick={() => setServicesDropdownOpen(false)}
                          >
                            <div className="font-bold">{srv.title}</div>
                            <div className="text-[11px] text-brand-secondary truncate mt-0.5">{srv.shortDescription}</div>
                          </Link>
                        ))}
                        <div className="border-t border-brand-border/60 mt-1.5 pt-1.5">
                          <Link
                            to="/services"
                            className="block px-3 py-2 text-xs font-bold text-brand-navy hover:text-brand-orange text-center bg-brand-light/80 rounded-xl transition-colors"
                            onClick={() => setServicesDropdownOpen(false)}
                          >
                            View All 10 Repair Services &rarr;
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Android & iPhone direct links: visible on xl+, cleanly tucked under Services on lg */}
              <Link
                to="/android-repair"
                className={cn(
                  'hidden xl:inline-flex px-2.5 xl:px-3 py-1.5 xl:py-2 text-[11px] xl:text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap shrink-0',
                  isActive('/android-repair')
                    ? 'text-brand-orange bg-brand-orange-light/50 font-bold'
                    : 'text-brand-navy hover:text-brand-orange hover:bg-brand-light/80'
                )}
              >
                Android Repair
              </Link>

              <Link
                to="/iphone-repair"
                className={cn(
                  'hidden xl:inline-flex px-2.5 xl:px-3 py-1.5 xl:py-2 text-[11px] xl:text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap shrink-0',
                  isActive('/iphone-repair')
                    ? 'text-brand-orange bg-brand-orange-light/50 font-bold'
                    : 'text-brand-navy hover:text-brand-orange hover:bg-brand-light/80'
                )}
              >
                iPhone Repair
              </Link>

              <Link
                to="/accessories"
                className={cn(
                  'px-2 xl:px-3 py-1.5 xl:py-2 text-[11px] xl:text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap shrink-0',
                  isActive('/accessories')
                    ? 'text-brand-orange bg-brand-orange-light/50 font-bold'
                    : 'text-brand-navy hover:text-brand-orange hover:bg-brand-light/80'
                )}
              >
                Accessories
              </Link>

              <Link
                to="/repair-status"
                className={cn(
                  'px-2 xl:px-3 py-1.5 xl:py-2 text-[11px] xl:text-xs font-semibold rounded-xl transition-all duration-200 inline-flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0',
                  isActive('/repair-status')
                    ? 'text-brand-orange bg-brand-orange-light/50 font-bold'
                    : 'text-brand-navy hover:text-brand-orange hover:bg-brand-light/80'
                )}
              >
                <Search className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span>Track Job</span>
              </Link>
            </nav>

            {/* Right Action: Cart & Book a Repair CTA */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
              {/* Cart Drawer Trigger */}
              <button
                onClick={openCart}
                className="relative px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-brand-navy hover:text-[#2874f0] transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 xl:gap-2 group shrink-0"
                title="View Shopping Cart"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4 text-[#2874f0] group-hover:scale-110 transition-transform shrink-0" />
                <span className="text-[11px] xl:text-xs font-bold text-slate-700 group-hover:text-[#2874f0] whitespace-nowrap">
                  Cart
                </span>
                {totalItems > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-[#F15B45] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>

              <Link to="/repair-request" className="shrink-0">
                <Button
                  size="md"
                  variant="glow"
                  leftIcon={<Wrench className="w-3.5 h-3.5 xl:w-4 xl:h-4" />}
                  className="text-xs xl:text-sm px-3.5 py-2 xl:px-4.5 xl:py-2.5 whitespace-nowrap shrink-0"
                >
                  Book a Repair
                </Button>
              </Link>
            </div>

            {/* Mobile Actions: Cart + (Book CTA on sm) + Menu Toggle */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={openCart}
                className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#2874f0] transition-colors shadow-2xs"
                title="View Shopping Cart"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 text-[#2874f0]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#F15B45] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>

              <Link to="/repair-request" className="hidden sm:inline-flex">
                <Button size="sm" variant="glow" className="text-xs px-2.5 py-1.5">
                  Book
                </Button>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-brand-navy hover:bg-brand-light/80 focus:outline-none transition-colors"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Animated Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden border-t border-brand-border/80 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1 shadow-xl overflow-hidden max-h-[calc(100vh-4.5rem)] overflow-y-auto"
            >
              <div className="py-2 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      isActive(link.path) && (link.path !== '/' || location.pathname === '/')
                        ? 'bg-brand-orange text-white shadow-sm'
                        : 'text-brand-navy hover:bg-brand-light'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 bg-[#F15B45] text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-brand-border space-y-2.5">
                <Link
                  to="/repair-request"
                  className="block w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button size="lg" variant="glow" className="w-full">
                    Request a Repair Online
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-brand-light text-brand-navy text-xs font-bold border border-brand-border shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Call Shop</span>
                  </a>
                  <a
                    href={createWhatsAppUrl('Hello Debasish, I would like to enquire about phone repair.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
