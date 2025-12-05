import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Shield, Key, FileText, Vault, Lock, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-background gradient-mesh">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Key,
      title: 'Password Manager',
      description: 'Store passwords with AES-256 encryption',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: FileText,
      title: 'Secure Notes',
      description: 'Private encrypted notes and documents',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Vault,
      title: 'Digital Vault',
      description: 'Cards, IDs, and sensitive documents',
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: Lock,
      title: 'Zero Knowledge',
      description: 'Only you can access your data',
      gradient: 'from-cyan-500 to-blue-600',
    },
  ];

  const benefits = [
    'Military-grade AES-256 encryption',
    'Zero-knowledge architecture',
    'Cross-platform sync',
    'Secure password generator',
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-display font-bold text-foreground leading-none">Personal</span>
              <span className="font-display font-bold gradient-primary-text leading-none">Manager</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary text-white border-0 shadow-glow hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 gradient-mesh" />
        
        {/* Floating shapes */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/30 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Your digital life, secured</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground tracking-tight animate-fade-in">
              Your Personal
              <span className="block gradient-primary-text">Security Vault</span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Manage passwords, notes, and sensitive documents with end-to-end encryption. 
              Your data stays private—only you hold the key.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto gradient-primary text-white border-0 shadow-glow hover:opacity-90 text-base px-8">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto glass text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Benefits list */}
            <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              Everything you need
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              One secure place for all your sensitive information
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl glass hover-glow transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security banner */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-90" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="relative p-8 sm:p-12 lg:p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white">
                Built with security first
              </h2>
              <p className="text-white/80 mt-4 max-w-xl mx-auto">
                AES-256-GCM encryption with PBKDF2 key derivation. Your master password never leaves your device.
              </p>
              <Link to="/auth" className="inline-block mt-8">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl">
                  Start Securing Your Data
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-foreground">Personal Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Personal Manager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
