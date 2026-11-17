import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wrench,
  PlusCircle,
  FileText,
  CreditCard,
  Package,
  ShieldCheck,
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Smartphone,
  Bell,
  Sparkles,
  Mic,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useVoice } from '../../context/VoiceContext';
import { SUPPORTED_VOICE_LANGUAGES } from '../../services/speechService';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export const AdminLayout: React.FC = () => {
  const { currentUser, logout, isOwner, isManager } = useAuth();
  const { settings } = useSettings();
  const { openAssistant, activeLanguage } = useVoice();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const currentVoiceLang = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === activeLanguage) || SUPPORTED_VOICE_LANGUAGES[0];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Repair Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Repair Jobs', path: '/admin/repairs', icon: Wrench },
    { label: 'Counter Intake (+)', path: '/admin/repairs/new', icon: PlusCircle, highlight: true },
    { label: 'Estimates', path: '/admin/estimates', icon: FileText },
    { label: 'Invoices', path: '/admin/invoices', icon: FileText },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Inventory & Parts', path: '/admin/inventory', icon: Package },
    { label: 'Warranties', path: '/admin/warranties', icon: ShieldCheck },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3, managerOnly: true },
    { label: 'Staff Management', path: '/admin/staff', icon: UserCheck, ownerOnly: true },
    { label: 'Business Settings', path: '/admin/settings', icon: Settings, ownerOnly: true },
  ];

  const isNavActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const filteredNavItems = navItems.filter((item) => {
    if (item.ownerOnly && !isOwner) return false;
    if (item.managerOnly && !isManager) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-light flex flex-col lg:flex-row text-brand-text">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-navy text-white shrink-0 shadow-2xl border-r border-brand-navy-dark select-none z-30">
        {/* Brand & Wordmark */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="relative group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/images/logo-transparent.webp"
                alt="MRH Logo"
                className="w-10 h-10 object-contain bg-white/10 rounded-xl p-0.5 border border-white/15"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-white group-hover:text-brand-orange-light transition-colors">
                MRH Portal
              </span>
              <span className="text-[10px] text-white/60 uppercase font-semibold tracking-wider">
                Mobile Repairing House
              </span>
            </div>
          </Link>
        </div>

        {/* User Info Bar with Live Status Beacon */}
        <div className="px-5 py-3.5 bg-brand-navy-dark/70 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-brand-navy-light flex items-center justify-center text-xs font-bold text-brand-orange border border-brand-orange/40 shrink-0">
                {currentUser?.displayName?.[0] || 'D'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-brand-navy" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.displayName || 'Debasish'}
              </div>
              <div className="text-[10px] text-brand-orange-light capitalize font-medium flex items-center gap-1">
                <span>{currentUser?.role || 'Owner'}</span>
                <span>&bull;</span>
                <span className="text-emerald-400">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const active = isNavActive(item.path, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group overflow-hidden',
                  active
                    ? 'text-white font-bold bg-brand-orange shadow-glow-orange'
                    : item.highlight
                    ? 'text-brand-orange hover:bg-white/5 font-bold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                    active ? 'text-white' : item.highlight ? 'text-brand-orange' : 'text-white/70'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-white/10 space-y-1.5">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-orange-light" />
              <span>Public Website</span>
            </span>
            <ChevronRight className="w-3 h-3 text-white/40" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-rose-300 hover:text-white hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-brand-navy hover:bg-brand-light focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping hidden sm:inline-block" />
              <div className="text-sm font-bold text-brand-navy tracking-tight truncate">
                {settings.businessName} <span className="text-brand-secondary font-normal">&mdash; Counter CRM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Multi-lingual Voice Counter Assistant Trigger */}
            <button
              type="button"
              onClick={() => openAssistant()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-navy/5 hover:bg-brand-navy text-brand-navy hover:text-white border border-brand-border transition-all text-xs font-bold shadow-2xs group"
              title="Voice Counter Assistant (Bengali বাংলা, Hindi हिन्दी, English -> Auto-translate to English)"
            >
              <div className="relative">
                <Mic className="w-4 h-4 text-brand-orange group-hover:text-white transition-colors" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-orange animate-ping" />
              </div>
              <span className="hidden md:inline">Voice Assistant</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-orange/10 group-hover:bg-white/20 text-brand-orange group-hover:text-white">
                {currentVoiceLang.nativeLabel}
              </span>
            </button>

            <Link to="/admin/repairs/new">
              <Button size="sm" variant="glow" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                <span className="hidden sm:inline">New Counter Intake</span>
                <span className="sm:hidden">Intake</span>
              </Button>
            </Link>
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-brand-secondary hover:text-brand-navy border border-brand-border px-3 py-1.5 rounded-xl hover:bg-brand-light transition-colors font-medium shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-orange" />
              <span>View Site</span>
            </Link>
          </div>
        </header>

        {/* Page Content Viewport with Smooth Page Transition */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Floating Quick Voice Assistant Trigger Button */}
        <div className="fixed bottom-6 right-6 z-30">
          <button
            type="button"
            onClick={() => openAssistant()}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-orange via-brand-orange to-brand-orange-dark text-white font-bold text-xs shadow-glow-orange hover:scale-105 active:scale-95 transition-all"
            title="Open Voice Counter Assistant (Speak in বাংলা, हिन्दी, English)"
          >
            <div className="relative flex items-center justify-center">
              <Mic className="w-4 h-4 text-white animate-pulse" />
              <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping pointer-events-none" />
            </div>
            <span className="hidden sm:inline font-bold">Voice Fill AI</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
              <span>{currentVoiceLang.flag}</span>
              <span>{currentVoiceLang.nativeLabel}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-72 bg-brand-navy text-white flex flex-col shadow-2xl z-10"
            >
              <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/images/logo-transparent.webp"
                    alt="MRH Logo"
                    className="w-8 h-8 object-contain bg-white/10 rounded-lg p-0.5 border border-white/10"
                  />
                  <span className="font-extrabold text-sm tracking-tight text-white">MRH Shop CRM</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => {
                  const active = isNavActive(item.path, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                        active
                          ? 'bg-brand-orange text-white font-bold shadow-glow-orange'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
