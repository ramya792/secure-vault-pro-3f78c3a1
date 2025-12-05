import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Key, FileText, Vault, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    {
      icon: Key,
      title: 'Password Manager',
      description: 'Store passwords with AES-256 encryption',
    },
    {
      icon: FileText,
      title: 'Secure Notes',
      description: 'Private encrypted notes and documents',
    },
    {
      icon: Vault,
      title: 'Digital Vault',
      description: 'Cards, IDs, and sensitive documents',
    },
    {
      icon: Lock,
      title: 'Zero Knowledge',
      description: 'Only you can access your data',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-primary text-primary-foreground shadow-premium-xl">
                <Shield className="h-10 w-10" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              Your Personal
              <span className="text-primary"> Security Vault</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Manage passwords, notes, and sensitive documents with end-to-end encryption. 
              Your data stays private—only you hold the key.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="premium" size="xl">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="xl">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border shadow-premium-sm hover:shadow-premium-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security banner */}
      <div className="container mx-auto px-4 pb-20">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-8 md:p-12 text-center">
          <Lock className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Built with security first</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            AES-256-GCM encryption with PBKDF2 key derivation. Your master password never leaves your device.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">PersonalManager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PersonalManager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
