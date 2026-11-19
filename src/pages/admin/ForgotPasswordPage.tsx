import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your staff email.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await resetPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Failed to send password reset instructions.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <img
          src="/images/logo-transparent.webp"
          alt="Mobile Repairing House Logo"
          className="w-16 h-16 object-contain mx-auto drop-shadow-xl"
        />
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Reset Staff Password
        </h2>
        <p className="text-xs text-white/70">
          Mobile Repairing House Staff Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white text-brand-text py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-brand-border space-y-6">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">Password Reset Complete</h3>
              <p className="text-xs text-brand-secondary leading-relaxed">
                Authorized staff account found for <strong className="text-brand-navy">{email}</strong>. Your password has been reset to the default workshop password: <strong className="text-brand-navy font-mono">Debasish@2026</strong>. You can now sign in and change it in your profile.
              </p>
              <div className="pt-2">
                <Link to="/admin/login">
                  <Button variant="primary" size="md" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-brand-secondary leading-relaxed">
                Enter your registered staff email address to receive secure password recovery instructions.
              </p>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Staff Email Address"
                type="email"
                required
                placeholder="name@mobilerepairinghouse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold"
                isLoading={loading}
              >
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-secondary hover:text-brand-navy"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
