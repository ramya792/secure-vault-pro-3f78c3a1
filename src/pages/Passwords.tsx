import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { encryptString, decryptString, generatePassword } from '@/lib/encryption';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Plus,
  Key,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  RefreshCw,
  Globe,
  User,
  Search,
  Loader2,
  Lock,
  Check,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  ciphertext: string;
  iv: string;
  url?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface DecryptedPassword extends PasswordEntry {
  decryptedPassword?: string;
}

export default function Passwords() {
  const { user, encryptionKey } = useAuth();
  const [passwords, setPasswords] = useState<DecryptedPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Generator settings
  const [genLength, setGenLength] = useState(16);
  const [genUppercase, setGenUppercase] = useState(true);
  const [genLowercase, setGenLowercase] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    if (user) {
      loadPasswords();
    }
  }, [user]);

  const loadPasswords = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const passwordsRef = collection(db, 'users', user.uid, 'secrets', 'passwords', 'items');
      const q = query(passwordsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const entries: DecryptedPassword[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DecryptedPassword));
      
      setPasswords(entries);
    } catch (error) {
      console.error('Error loading passwords:', error);
      toast.error('Failed to load passwords');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const generated = generatePassword({
      length: genLength,
      uppercase: genUppercase,
      lowercase: genLowercase,
      numbers: genNumbers,
      symbols: genSymbols,
    });
    setFormPassword(generated);
  };

  const handleSavePassword = async () => {
    if (!user || !encryptionKey) {
      toast.error('Please sign in to save passwords');
      return;
    }

    if (!formTitle.trim() || !formPassword.trim()) {
      toast.error('Title and password are required');
      return;
    }

    setIsSaving(true);
    try {
      const { ciphertext, iv } = await encryptString(encryptionKey, formPassword);
      
      const passwordsRef = collection(db, 'users', user.uid, 'secrets', 'passwords', 'items');
      await addDoc(passwordsRef, {
        title: formTitle.trim(),
        username: formUsername.trim(),
        ciphertext,
        iv,
        url: formUrl.trim(),
        notes: formNotes.trim(),
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast.success('Password saved securely');
      setIsAddDialogOpen(false);
      resetForm();
      loadPasswords();
    } catch (error) {
      console.error('Error saving password:', error);
      toast.error('Failed to save password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePassword = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'secrets', 'passwords', 'items', id));
      setPasswords(passwords.filter(p => p.id !== id));
      toast.success('Password deleted');
    } catch (error) {
      console.error('Error deleting password:', error);
      toast.error('Failed to delete password');
    }
  };

  const togglePasswordVisibility = async (entry: DecryptedPassword) => {
    if (!encryptionKey) return;

    if (visiblePasswords.has(entry.id)) {
      setVisiblePasswords(prev => {
        const next = new Set(prev);
        next.delete(entry.id);
        return next;
      });
      return;
    }

    try {
      if (!entry.decryptedPassword) {
        const decrypted = await decryptString(encryptionKey, entry.ciphertext, entry.iv);
        setPasswords(prev => prev.map(p => 
          p.id === entry.id ? { ...p, decryptedPassword: decrypted } : p
        ));
      }
      setVisiblePasswords(prev => new Set(prev).add(entry.id));
    } catch (error) {
      console.error('Error decrypting password:', error);
      toast.error('Failed to decrypt password');
    }
  };

  const copyPassword = async (entry: DecryptedPassword) => {
    if (!encryptionKey) return;

    try {
      let password = entry.decryptedPassword;
      if (!password) {
        password = await decryptString(encryptionKey, entry.ciphertext, entry.iv);
      }
      await navigator.clipboard.writeText(password);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Password copied to clipboard');
    } catch (error) {
      console.error('Error copying password:', error);
      toast.error('Failed to copy password');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormUsername('');
    setFormPassword('');
    setFormUrl('');
    setFormNotes('');
    setShowGenerator(false);
  };

  const filteredPasswords = passwords.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Passwords</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Securely store and manage your credentials
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="premium" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              Add Password
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add new password</DialogTitle>
              <DialogDescription>
                Your password will be encrypted before storage
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="title"
                    placeholder="e.g., Gmail, Netflix"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="your@email.com"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password *</Label>
                  <button
                    type="button"
                    onClick={() => setShowGenerator(!showGenerator)}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <Settings2 className="h-3 w-3" />
                    Generator
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="text"
                    placeholder="Enter or generate password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="pl-10 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Generate password"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <PasswordStrengthMeter password={formPassword} />
              </div>

              {showGenerator && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Length: {genLength}</span>
                      <input
                        type="range"
                        min="8"
                        max="32"
                        value={genLength}
                        onChange={(e) => setGenLength(Number(e.target.value))}
                        className="w-24"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'A-Z', value: genUppercase, setter: setGenUppercase },
                        { label: 'a-z', value: genLowercase, setter: setGenLowercase },
                        { label: '0-9', value: genNumbers, setter: setGenNumbers },
                        { label: '!@#', value: genSymbols, setter: setGenSymbols },
                      ].map(opt => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => opt.setter(!opt.value)}
                          className={cn(
                            'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                            opt.value
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="premium" onClick={handleSavePassword} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Encrypting...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Save securely
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search passwords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Password list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPasswords.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Key className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground">No passwords yet</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
              {searchQuery
                ? 'No passwords match your search'
                : 'Add your first password to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredPasswords.map((entry) => (
            <Card key={entry.id} variant="interactive">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {entry.username || 'No username'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePasswordVisibility(entry)}
                      className="h-8 w-8"
                    >
                      {visiblePasswords.has(entry.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyPassword(entry)}
                      className="h-8 w-8"
                    >
                      {copiedId === entry.id ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePassword(entry.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {visiblePasswords.has(entry.id) && entry.decryptedPassword && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="font-mono text-sm bg-muted px-3 py-2 rounded-lg break-all">
                      {entry.decryptedPassword}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
