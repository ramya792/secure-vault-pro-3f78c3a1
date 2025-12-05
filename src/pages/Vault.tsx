import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { encryptString, decryptString } from '@/lib/encryption';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Plus,
  Vault as VaultIcon,
  Trash2,
  Search,
  Loader2,
  Lock,
  CreditCard,
  FileText,
  IdCard,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

type VaultItemType = 'card' | 'document' | 'identity';

interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  ciphertext: string;
  iv: string;
  createdAt: string;
}

interface DecryptedVaultItem extends VaultItem {
  decryptedData?: Record<string, string>;
}

const typeConfig = {
  card: {
    icon: CreditCard,
    label: 'Credit Card',
    color: 'bg-primary/10 text-primary',
    fields: ['cardNumber', 'cardHolder', 'expiry', 'cvv'],
    labels: { cardNumber: 'Card Number', cardHolder: 'Cardholder Name', expiry: 'Expiry (MM/YY)', cvv: 'CVV' }
  },
  document: {
    icon: FileText,
    label: 'Document',
    color: 'bg-warning/10 text-warning',
    fields: ['documentNumber', 'issueDate', 'expiryDate', 'notes'],
    labels: { documentNumber: 'Document Number', issueDate: 'Issue Date', expiryDate: 'Expiry Date', notes: 'Notes' }
  },
  identity: {
    icon: IdCard,
    label: 'Identity',
    color: 'bg-success/10 text-success',
    fields: ['fullName', 'idNumber', 'dateOfBirth', 'address'],
    labels: { fullName: 'Full Name', idNumber: 'ID Number', dateOfBirth: 'Date of Birth', address: 'Address' }
  }
};

export default function Vault() {
  const { user, encryptionKey } = useAuth();
  const [items, setItems] = useState<DecryptedVaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DecryptedVaultItem | null>(null);
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<VaultItemType>('card');
  const [formTitle, setFormTitle] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const itemsRef = collection(db, 'users', user.uid, 'secrets', 'vault', 'items');
      const q = query(itemsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const entries: DecryptedVaultItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DecryptedVaultItem));
      
      setItems(entries);
    } catch (error) {
      console.error('Error loading vault items:', error);
      toast.error('Failed to load vault items');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!user || !encryptionKey) {
      toast.error('Please sign in to save items');
      return;
    }

    if (!formTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const dataToEncrypt = JSON.stringify(formData);
      const { ciphertext, iv } = await encryptString(encryptionKey, dataToEncrypt);
      
      const itemsRef = collection(db, 'users', user.uid, 'secrets', 'vault', 'items');
      await addDoc(itemsRef, {
        type: formType,
        title: formTitle.trim(),
        ciphertext,
        iv,
        createdAt: new Date().toISOString(),
      });

      toast.success('Item saved securely');
      setIsAddDialogOpen(false);
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'secrets', 'vault', 'items', id));
      setItems(items.filter(i => i.id !== id));
      setIsViewDialogOpen(false);
      toast.success('Item deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const openItem = async (item: DecryptedVaultItem) => {
    if (!encryptionKey) return;

    try {
      const decrypted = await decryptString(encryptionKey, item.ciphertext, item.iv);
      const data = JSON.parse(decrypted);
      setSelectedItem({ ...item, decryptedData: data });
      setVisibleFields(new Set());
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error decrypting item:', error);
      toast.error('Failed to decrypt item');
    }
  };

  const toggleFieldVisibility = (field: string) => {
    setVisibleFields(prev => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const copyToClipboard = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard');
  };

  const resetForm = () => {
    setFormType('card');
    setFormTitle('');
    setFormData({});
    setSelectedItem(null);
    setVisibleFields(new Set());
  };

  const filteredItems = items.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TypeIcon = typeConfig[formType].icon;

  return (
    <div className="space-y-6 animate-fade-in pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Digital Vault</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Secure storage for cards and documents
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="premium" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Item</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add to vault</DialogTitle>
              <DialogDescription>
                Your data will be encrypted before storage
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v) => {
                  setFormType(v as VaultItemType);
                  setFormData({});
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder={`e.g., My ${typeConfig[formType].label}`}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {typeConfig[formType].fields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{typeConfig[formType].labels[field as keyof typeof typeConfig[typeof formType]['labels']]}</Label>
                  <Input
                    id={field}
                    type={field === 'cvv' ? 'password' : 'text'}
                    placeholder={typeConfig[formType].labels[field as keyof typeof typeConfig[typeof formType]['labels']]}
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="premium" onClick={handleSaveItem} disabled={isSaving} className="w-full sm:w-auto">
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
          placeholder="Search vault..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full sm:max-w-md"
        />
      </div>

      {/* Items list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <VaultIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground">Vault is empty</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
              {searchQuery
                ? 'No items match your search'
                : 'Add cards, documents or IDs to your vault'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const config = typeConfig[item.type];
            const ItemIcon = config.icon;
            return (
              <Card
                key={item.id}
                variant="interactive"
                className="cursor-pointer group"
                onClick={() => openItem(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', config.color)}>
                      <ItemIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {config.label}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground mt-3 truncate">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Encrypted
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && (
                <>
                  {(() => {
                    const Icon = typeConfig[selectedItem.type].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                  {selectedItem.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedItem && typeConfig[selectedItem.type].label}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem?.decryptedData && (
            <div className="space-y-3 py-4">
              {typeConfig[selectedItem.type].fields.map((field) => {
                const value = selectedItem.decryptedData?.[field];
                if (!value) return null;
                
                const isVisible = visibleFields.has(field);
                const isSensitive = ['cardNumber', 'cvv', 'idNumber', 'documentNumber'].includes(field);
                
                return (
                  <div key={field} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {typeConfig[selectedItem.type].labels[field as keyof typeof typeConfig[typeof selectedItem.type]['labels']]}
                      </span>
                      <div className="flex items-center gap-1">
                        {isSensitive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleFieldVisibility(field)}
                          >
                            {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(value, field)}
                        >
                          {copiedField === field ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-foreground">
                      {isSensitive && !isVisible ? '••••••••' : value}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedItem && handleDeleteItem(selectedItem.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}