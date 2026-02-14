'use client';

import React from "react"

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showVerify, setShowVerify] = useState(false);
  const [verifyEmailState, setVerifyEmailState] = useState<{ email?: string }>({});
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (showVerify) {
      setTimeout(() => {
        const el = document.getElementById('code-0') as HTMLInputElement | null;
        if (el) el.focus();
      }, 50);
    }
  }, [showVerify]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const auth = useAuth();
  const search = useSearchParams();

  const handleDigitChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    setCodeDigits(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    const nextEl = document.getElementById(`code-${index + 1}`) as HTMLInputElement | null;
    if (val && nextEl) nextEl.focus();
  };

  // Helper function to redirect based on user role
  const redirectBasedOnRole = (role: string) => {
    if (role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyMessage(null);
    const code = codeDigits.join('');
    if (code.length !== 6) {
      setVerifyMessage('Please enter the 6-digit code');
      setIsVerifying(false);
      return;
    }
    try {
      const res: any = await api.verifyEmail({ email: verifyEmailState.email!, code });
      auth.login(res.user, res.token);
      // Redirect based on user role
      redirectBasedOnRole(res.user.role);
    } catch (err: any) {
      console.error(err);
      setVerifyMessage(err?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.resendVerification({ email: verifyEmailState.email! });
      setVerifyMessage('Verification code resent');
      setCodeDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      console.error(err);
      setVerifyMessage(err?.message || 'Failed to resend');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const res: any = await api.login({ email: formData.email, password: formData.password });
      // use AuthProvider to store auth and update UI
      auth.login(res.user, res.token);
      
      // Redirect based on user role - admin goes to admin dashboard, user goes to home
      redirectBasedOnRole(res.user.role);
    } catch (err: any) {
      console.error(err);
      if (err?.message && err.message.includes('Email not verified')) {
        // open verification modal
        setVerifyEmailState({ email: formData.email });
        setShowVerify(true);
      } else {
        alert(err?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar cartCount={0} />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-3xl mx-auto mb-4">
              🍕
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your PizzaHub account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-sm border border-border space-y-6">
            <div>
              <Label className="text-foreground flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-foreground flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link href="#" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Info */}
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong>Demo Note:</strong> Use any email and password to log in. Your session is stored locally.
            </p>
          </div>

          {/* Verification Dialog */}
          <Dialog open={showVerify} onOpenChange={(open) => { if (!open) setShowVerify(false); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify your email</DialogTitle>
                <DialogDescription>
                  Enter the 6-digit verification code we sent to <span className="font-medium">{verifyEmailState.email}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 grid gap-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  {codeDigits.map((d, i) => (
                    <Input
                      key={i}
                      id={`code-${i}`}
                      value={d}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      className="w-12 h-12 text-center text-lg font-mono"
                      maxLength={1}
                    />
                  ))}
                </div>

                {verifyMessage && <p className="text-sm text-red-500">{verifyMessage}</p>}

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button onClick={handleVerify} disabled={isVerifying} size="sm">
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </Button>
                  <Button variant="ghost" onClick={handleResend} size="sm">Resend code</Button>
                </div>

                <div className="text-xs text-muted-foreground mt-2">Didn't receive the code? Check your spam folder or try again.</div>

                <DialogFooter>
                  <DialogClose />
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <Footer />
    </main>
  );
}
