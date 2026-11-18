import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wrench,
  PlusCircle,
  Receipt,
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
  ChevronLeft,
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

interface NavSection {
  title: string;
  items: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    highlight?: boolean;
    ownerOnly?: boolean;
    managerOnly?: boolean;
    badge?: string;
  }[];
}

export const AdminLayout: React.FC = () => {
  const { currentUser, logout, isOwner, isManager } = useAuth();
  const { settings } = useSettings();
  const { openAssistant, activeLanguage } = useVoice();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentVoiceLang =
    SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === activeLanguage) || SUPPORTED_VOICE_LANGUAGES[0];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navSections: NavSection[] = [
    {
      title: 'Counter Desk',
      items: [
        {
          label: 'In-Counter Billing (+)',
          path: '/admin/billing',
          icon: Receipt,
          highlight: true,
          badge: 'POS',
        },
        {
          label: 'Counter Intake (+)',
          path: '/admin/repairs/new',
          icon: PlusCircle,
          highlight: true,
          badge: 'New',
        },
      ],
    },
    {
      title: 'Workshop & Repairs',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
        { label: 'Repair Jobs', path: '/admin/repairs', icon: Wrench },
        { label: 'Estimates', path: '/admin/estimates', icon: FileText },
        { label: 'Warranties', path: '/admin/warranties', icon: ShieldCheck },
      ],
    },
    {
      title: 'Billing & Ledger',
      items: [
        { label: 'Bills & Invoices', path: '/admin/invoices', icon: FileText },
        { label: 'Payments Ledger', path: '/admin/payments', icon: CreditCard },
        { label: 'Inventory & Parts', path: '/admin/inventory', icon: Package },
      ],
    },
    {
      title: 'CRM & Administration',
      items: [
        { label: 'Customers', path: '/admin/customers', icon: Users },
        { label: 'Repair Enquiries', path: '/admin/enquiries', icon: MessageSquare },
        { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3, managerOnly: true },
        { label: 'Staff Management', path: '/admin/staff', icon: UserCheck, ownerOnly: true },
        { label: 'Business Settings', path: '/admin/settings', icon: Settings, ownerOnly: true },
      ],
    },
  ];

  // Precise route matching that eliminates collisions
  const isNavActive = (path: string, exact?: boolean) => {
    if (exact || path === '/admin') {
      return location.pathname === path;
    }
    if (path === '/admin/repairs') {
      return (
        location.pathname === '/admin/repairs' ||
        (location.pathname.startsWith('/admin/repairs/') && location.pathname !== '/admin/repairs/new')
      );
    }
    if (path === '/admin/billing') {
      return location.pathname === '/admin/billing' || location.pathname === '/admin/counter-billing';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const filterItem = (item: NavSection['items'][0]) => {
    if (item.ownerOnly && !isOwner) return false;
    if (item.managerOnly && !isManager) return false;
    return true;
  };

  return (
    <div className="h-screen max-h-screen bg-brand-light flex flex-col lg:flex-row text-brand-text overflow-hidden select-none">
      {/* ============================================================== */}
      {/* DESKTOP FIXED SIDEBAR                                         */}
      {/* ============================================================== */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 bg-brand-navy text-white shrink-0 shadow-2xl border-r border-brand-navy-dark z-30 transition-all duration-200 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand & Wordmark */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link to="/admin" className="flex items-center gap-3 group overflow-hidden">
            <div className="relative group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/images/logo-transparent.webp"
                alt="MRH Logo"
                className="w-9 h-9 object-contain bg-white/10 rounded-xl p-0.5 border border-white/15"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-black text-sm tracking-tight text-white group-hover:text-brand-orange-light transition-colors truncate">
                  Rajib da MRH
                </span>
                <span className="text-[10px] text-white/60 uppercase font-semibold tracking-wider truncate">
                  Counter & Workshop CRM
                </span>
              </div>
            )}
          </Link>

          {/* Collapse/Expand Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Info Bar */}
        {!isCollapsed ? (
          <div className="px-4 py-3 bg-brand-navy-dark/70 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-brand-navy-light flex items-center justify-center text-xs font-bold text-brand-orange border border-brand-orange/40">
                  {currentUser?.displayName?.[0] || 'D'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-brand-navy" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.displayName || 'Debasish (Owner)'}
                </div>
                <div className="text-[10px] text-brand-orange-light capitalize font-medium flex items-center gap-1">
                  <span>{currentUser?.role || 'Owner'}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400">Online</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2.5 flex justify-center border-b border-white/5 shrink-0">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-brand-navy-light flex items-center justify-center text-[11px] font-bold text-brand-orange border border-brand-orange/40">
                {currentUser?.displayName?.[0] || 'D'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-brand-navy" />
            </div>
          </div>
        )}

        {/* Navigation Sections with Smooth Scrolling */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(filterItem);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    {section.title}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const active = isNavActive(item.path, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group overflow-hidden',
                        active
                          ? 'text-white font-bold bg-brand-orange shadow-glow-orange'
                          : item.highlight
                          ? 'text-brand-orange hover:bg-white/10 font-bold bg-white/5'
                          : 'text-white/80 hover:bg-white/10 hover:text-white',
                        isCollapsed && 'justify-center px-2 py-2.5'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                          active ? 'text-white' : item.highlight ? 'text-brand-orange' : 'text-white/70'
                        )}
                      />
                      {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                      {!isCollapsed && item.badge && !active && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-brand-orange/20 text-brand-orange-light">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 space-y-1 shrink-0 bg-brand-navy-dark/40">
          <Link
            to="/"
            target="_blank"
            title={isCollapsed ? 'View Public Website' : undefined}
            className={cn(
              'flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <ExternalLink className="w-3.5 h-3.5 text-brand-orange-light shrink-0" />
              {!isCollapsed && <span className="truncate">Public Website</span>}
            </span>
            {!isCollapsed && <ChevronRight className="w-3 h-3 text-white/40" />}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-rose-300 hover:text-white hover:bg-rose-950/40 transition-colors',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT AREA                                             */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Sticky Navbar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-20 shrink-0 select-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-brand-navy hover:bg-brand-light focus:outline-none"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping hidden sm:inline-block shrink-0" />
              <div className="text-sm font-bold text-brand-navy tracking-tight truncate">
                {settings.businessName || 'Rajib da Mobile Repairing House'}{' '}
                <span className="text-brand-secondary font-normal">&mdash; Counter CRM</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Multi-lingual Voice Counter Assistant Trigger */}
            <button
              type="button"
              onClick={() => openAssistant()}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-brand-navy/5 hover:bg-brand-navy text-brand-navy hover:text-white border border-brand-border transition-all text-xs font-bold shadow-2xs group"
              title="Voice Counter Assistant (Bengali বাংলা, Hindi हिन्दी, English -> Auto-translate)"
            >
              <div className="relative">
                <Mic className="w-3.5 h-3.5 text-brand-orange group-hover:text-white transition-colors" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping" />
              </div>
              <span className="hidden md:inline">Voice AI</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-brand-orange/10 group-hover:bg-white/20 text-brand-orange group-hover:text-white">
                {currentVoiceLang.nativeLabel}
              </span>
            </button>

            {/* In-Counter Billing Quick Button */}
            <Link to="/admin/billing">
              <Button size="sm" variant="glow" leftIcon={<Receipt className="w-3.5 h-3.5" />}>
                <span className="hidden sm:inline">Make Bill</span>
                <span className="sm:hidden">Bill</span>
              </Button>
            </Link>

            {/* Counter Intake Quick Button */}
            <Link to="/admin/repairs/new">
              <Button size="sm" variant="outline" leftIcon={<PlusCircle className="w-3.5 h-3.5 text-brand-orange" />}>
                <span className="hidden sm:inline">Intake Job</span>
                <span className="sm:hidden">Intake</span>
              </Button>
            </Link>

            <Link
              to="/"
              target="_blank"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-brand-secondary hover:text-brand-navy border border-brand-border px-3 py-1.5 rounded-xl hover:bg-brand-light transition-colors font-medium shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-orange" />
              <span>Site</span>
            </Link>
          </div>
        </header>

        {/* Page Content Viewport with Smooth Independent Scrolling */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 overscroll-contain select-auto">
          <div className="max-w-7xl mx-auto pb-12">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* MOBILE DRAWER WITH ANIMATEPRESENCE                             */}
      {/* ============================================================== */}
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
              className="fixed inset-y-0 left-0 w-72 bg-brand-navy text-white flex flex-col shadow-2xl z-10 h-full max-h-screen"
            >
              {/* Header */}
              <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/images/logo-transparent.webp"
                    alt="MRH Logo"
                    className="w-8 h-8 object-contain bg-white/10 rounded-lg p-0.5 border border-white/10"
                  />
                  <span className="font-extrabold text-sm tracking-tight text-white">Rajib da MRH CRM</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info in mobile */}
              <div className="px-5 py-3 bg-brand-navy-dark border-b border-white/5 flex items-center gap-2.5 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-brand-navy-light flex items-center justify-center text-xs font-bold text-brand-orange border border-brand-orange/40">
                  {currentUser?.displayName?.[0] || 'D'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{currentUser?.displayName || 'Debasish'}</div>
                  <div className="text-[10px] text-brand-orange-light capitalize font-medium">{currentUser?.role || 'Owner'}</div>
                </div>
              </div>

              {/* Scrollable Nav List */}
              <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto overscroll-contain">
                {navSections.map((section) => {
                  const visibleItems = section.items.filter(filterItem);
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={section.title} className="space-y-1">
                      <div className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                        {section.title}
                      </div>
                      {visibleItems.map((item) => {
                        const active = isNavActive(item.path, item.exact);
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={cn(
                              'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all',
                              active
                                ? 'bg-brand-orange text-white font-bold shadow-glow-orange'
                                : item.highlight
                                ? 'text-brand-orange hover:bg-white/10 font-bold bg-white/5'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 shrink-0" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && !active && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-orange/20 text-brand-orange-light">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-white/10 space-y-2 shrink-0 bg-brand-navy-dark/40">
                <Link
                  to="/"
                  target="_blank"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-brand-orange-light" />
                    <span>View Public Website</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-white/40" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white font-medium transition-colors"
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
