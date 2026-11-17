import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
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

  // If already logged in, redirect to admin
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
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
      navigate('/admin');
    } else {
      setError(res.error || 'Failed to authenticate. Please check your credentials.');
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError('');
    const res = await login('debasish@mobilerepairinghouse.com', 'debasish123');
    setLoading(false);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Failed to authenticate.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img
            src="/images/logo-transparent.webp"
            alt="Mobile Repairing House Logo"
            className="w-20 h-20 object-contain mx-auto drop-shadow-xl hover:scale-105 transition-transform"
          />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Mobile Repairing House
        </h2>
        <p className="text-xs text-white/70">
          Staff & Workshop Management Portal &bull; Dunlop, Kolkata
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white text-brand-text py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-brand-border space-y-6">
          <div className="border-b border-brand-border pb-4">
            <h3 className="text-lg font-bold text-brand-navy">Staff Sign In</h3>
            <p className="text-xs text-brand-secondary mt-0.5">
              Secure access for Debasish and authorized repair staff.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff Email Address"
              type="email"
              required
              placeholder="e.g. debasish@mobilerepairinghouse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <Link
                to="/admin/forgot-password"
                className="text-brand-orange hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-sm"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to CRM
            </Button>
          </form>

          {/* Quick Access Helper */}
          <div className="pt-4 border-t border-brand-border space-y-2">
            <div className="text-[11px] text-center text-brand-secondary font-medium">
              Demo / Owner Fast Sign-In:
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold bg-brand-light hover:bg-brand-muted"
              onClick={handleQuickDemoLogin}
              leftIcon={<KeyRound className="w-3.5 h-3.5 text-brand-orange" />}
            >
              Sign In as Debasish (Owner)
            </Button>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/"
              className="text-xs text-brand-secondary hover:text-brand-navy underline"
            >
              &larr; Back to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
