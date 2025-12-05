import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Key, FileText, CheckSquare, Vault, Wallet, Shield, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickActions = [
  {
    to: '/passwords',
    icon: Key,
    title: 'Passwords',
    description: 'Manage your secure credentials',
    gradient: 'from-violet-500 to-purple-600',
    bgGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)]',
  },
  {
    to: '/notes',
    icon: FileText,
    title: 'Notes',
    description: 'Private encrypted notes',
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]',
  },
  {
    to: '/todos',
    icon: CheckSquare,
    title: 'Todo Lists',
    description: 'Track tasks and reminders',
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)]',
  },
  {
    to: '/vault',
    icon: Vault,
    title: 'Digital Vault',
    description: 'Cards & documents',
    gradient: 'from-rose-500 to-pink-600',
    bgGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)]',
  },
  {
    to: '/finance',
    icon: Wallet,
    title: 'Finance',
    description: 'Track expenses & income',
    gradient: 'from-cyan-500 to-blue-600',
    bgGlow: 'group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)]',
  },
];

const stats = [
  { label: 'Passwords', value: '—', icon: Key, trend: '+2 this week' },
  { label: 'Notes', value: '—', icon: FileText, trend: '3 recent' },
  { label: 'Tasks', value: '—', icon: CheckSquare, trend: '5 pending' },
  { label: 'Documents', value: '—', icon: Vault, trend: 'All secure' },
];

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse-subtle" />
          <span className="text-sm font-medium text-primary">Welcome back</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
          {profile?.displayName ? `Hello, ${profile.displayName.split(' ')[0]}` : 'Your Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          Your personal manager dashboard. Everything encrypted, always secure.
        </p>
      </div>

      {/* Security status */}
      <Card className="overflow-hidden border-0 shadow-premium-lg">
        <div className="relative">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-white text-lg">End-to-end encryption active</h3>
                <p className="text-white/80 text-sm mt-1">
                  All sensitive data is encrypted locally before storage
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-white">Secure</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Quick access</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link key={action.to} to={action.to}>
              <Card 
                className={`h-full group cursor-pointer transition-all duration-300 hover:-translate-y-1 border-0 glass ${action.bgGlow}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mt-4">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Overview</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.label} 
              className="glass border-0 hover-glow"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl sm:text-3xl font-display font-bold text-foreground mt-3">{stat.value}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-muted-foreground">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
