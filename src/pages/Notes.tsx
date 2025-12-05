import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { encryptString, decryptString } from '@/lib/encryption';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Plus,
  FileText,
  Trash2,
  Search,
  Loader2,
  Lock,
  Edit2,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteEntry {
  id: string;
  title: string;
  ciphertext: string;
  iv: string;
  createdAt: string;
  updatedAt: string;
}

interface DecryptedNote extends NoteEntry {
  decryptedContent?: string;
}

export default function Notes() {
  const { user, encryptionKey } = useAuth();
  const [notes, setNotes] = useState<DecryptedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DecryptedNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const notesRef = collection(db, 'users', user.uid, 'secrets', 'notes', 'items');
      const q = query(notesRef, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const entries: DecryptedNote[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DecryptedNote));
      
      setNotes(entries);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!user || !encryptionKey) {
      toast.error('Please sign in to save notes');
      return;
    }

    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setIsSaving(true);
    try {
      const { ciphertext, iv } = await encryptString(encryptionKey, formContent);
      
      if (isEditing && selectedNote) {
        // Update existing note
        const noteRef = doc(db, 'users', user.uid, 'secrets', 'notes', 'items', selectedNote.id);
        await updateDoc(noteRef, {
          title: formTitle.trim(),
          ciphertext,
          iv,
          updatedAt: new Date().toISOString(),
        });
        toast.success('Note updated');
      } else {
        // Create new note
        const notesRef = collection(db, 'users', user.uid, 'secrets', 'notes', 'items');
        await addDoc(notesRef, {
          title: formTitle.trim(),
          ciphertext,
          iv,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.success('Note saved securely');
      }

      setIsAddDialogOpen(false);
      setIsViewDialogOpen(false);
      resetForm();
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'secrets', 'notes', 'items', id));
      setNotes(notes.filter(n => n.id !== id));
      setIsViewDialogOpen(false);
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const openNote = async (note: DecryptedNote) => {
    if (!encryptionKey) return;

    try {
      const decrypted = await decryptString(encryptionKey, note.ciphertext, note.iv);
      setSelectedNote({ ...note, decryptedContent: decrypted });
      setFormTitle(note.title);
      setFormContent(decrypted);
      setIsEditing(false);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error decrypting note:', error);
      toast.error('Failed to decrypt note');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setSelectedNote(null);
    setIsEditing(false);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Private encrypted notes
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="premium" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Note</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create new note</DialogTitle>
              <DialogDescription>
                Your note will be encrypted before storage
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Note title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your note here..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="premium" onClick={handleSaveNote} disabled={isSaving} className="w-full sm:w-auto">
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
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full sm:max-w-md"
        />
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground">No notes yet</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
              {searchQuery
                ? 'No notes match your search'
                : 'Create your first encrypted note'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              variant="interactive"
              className="cursor-pointer group"
              onClick={() => openNote(note)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="font-medium text-foreground mt-3 truncate">{note.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Encrypted content
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View/Edit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? 'Edit note' : selectedNote?.title}
            </DialogTitle>
            {!isEditing && (
              <DialogDescription>
                Last updated: {selectedNote && new Date(selectedNote.updatedAt).toLocaleString()}
              </DialogDescription>
            )}
          </DialogHeader>
          
          {isEditing ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap text-sm max-h-64 overflow-y-auto">
                {selectedNote?.decryptedContent}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedNote && handleDeleteNote(selectedNote.id)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button variant="premium" onClick={handleSaveNote} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}