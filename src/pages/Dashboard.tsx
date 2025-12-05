import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, FileText, CheckSquare, Vault, Wallet, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickActions = [
  {
    to: '/passwords',
    icon: Key,
    title: 'Passwords',
    description: 'Manage your secure credentials',
    color: 'bg-primary/10 text-primary',
  },
  {
    to: '/notes',
    icon: FileText,
    title: 'Notes',
    description: 'Private encrypted notes',
    color: 'bg-success/10 text-success',
  },
  {
    to: '/todos',
    icon: CheckSquare,
    title: 'Todo Lists',
    description: 'Track tasks and reminders',
    color: 'bg-warning/10 text-warning',
  },
  {
    to: '/vault',
    icon: Vault,
    title: 'Digital Vault',
    description: 'Cards & documents',
    color: 'bg-destructive/10 text-destructive',
  },
  {
    to: '/finance',
    icon: Wallet,
    title: 'Finance',
    description: 'Track expenses & income',
    color: 'bg-primary/10 text-primary',
  },
];

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in pt-12 lg:pt-0">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back{profile?.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Your personal manager dashboard. Everything encrypted, always secure.
        </p>
      </div>

      {/* Security status */}
      <Card variant="elevated" className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">End-to-end encryption active</h3>
              <p className="text-sm text-muted-foreground">
                All sensitive data is encrypted locally before storage
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Secure
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick access</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <Card variant="interactive" className="h-full group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  <h3 className="font-semibold text-foreground mt-4">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats placeholder */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Overview</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Passwords', value: '—', icon: Key },
            { label: 'Notes', value: '—', icon: FileText },
            { label: 'Tasks', value: '—', icon: CheckSquare },
            { label: 'Documents', value: '—', icon: Vault },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
