import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect directly to admin portal
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(res.error || 'Failed to authenticate. Please check your credentials.');
    }
  };

  return (
    <div className="h-screen max-h-screen w-full bg-brand-navy flex flex-col justify-center items-center px-4 overflow-hidden relative selection:bg-brand-orange selection:text-white">
      {/* Background radial gradient accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-3 sm:mb-4">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <img
              src="/images/logo-transparent.webp"
              alt="Mobile Repairing House"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain mx-auto drop-shadow-xl"
            />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5">
            Mobile Repairing House
          </h1>
          <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">
            Staff & Workshop Management Portal &bull; Dunlop, Kolkata
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white text-brand-text p-6 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xl border border-brand-border space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-brand-navy flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Staff Sign In
              </h2>
              <p className="text-[11px] sm:text-xs text-brand-secondary">
                Authorized workshop access for Debasish & team
              </p>
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-brand-navy border border-blue-200">
              Live DB
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Staff Email Address"
              type="email"
              required
              autoComplete="email"
              placeholder="e.g. debasish@mobilerepairinghouse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <Input
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end mt-1">
                <Link
                  to="/admin/forgot-password"
                  className="text-[11px] text-brand-orange hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-sm py-2.5 sm:py-3 mt-1"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to CRM
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-brand-border/60">
            <Link
              to="/"
              className="text-xs text-brand-secondary hover:text-brand-navy font-medium transition-colors"
            >
              &larr; Back to Public Website
            </Link>
          </div>
        </div>

        {/* Trust & Security Tag */}
        <p className="text-[10px] text-white/40 text-center mt-3 tracking-wide">
          Secured by Neon PostgreSQL Connection Pool &bull; Kolkata Workshop
        </p>
      </div>
    </div>
  );
};
