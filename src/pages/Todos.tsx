import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Plus,
  CheckSquare,
  Trash2,
  Search,
  Loader2,
  Circle,
  CheckCircle2,
  Calendar,
  Clock,
  ListTodo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Todos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const todosRef = collection(db, 'users', user.uid, 'todos');
      const q = query(todosRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const entries: TodoItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TodoItem));
      
      setTodos(entries);
    } catch (error) {
      console.error('Error loading todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTodo = async () => {
    if (!user) {
      toast.error('Please sign in to save todos');
      return;
    }

    if (!formTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const todosRef = collection(db, 'users', user.uid, 'todos');
      await addDoc(todosRef, {
        title: formTitle.trim(),
        completed: false,
        dueDate: formDueDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast.success('Todo added');
      setIsAddDialogOpen(false);
      resetForm();
      loadTodos();
    } catch (error) {
      console.error('Error saving todo:', error);
      toast.error('Failed to save todo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTodo = async (todo: TodoItem) => {
    if (!user) return;

    try {
      const todoRef = doc(db, 'users', user.uid, 'todos', todo.id);
      await updateDoc(todoRef, {
        completed: !todo.completed,
        updatedAt: new Date().toISOString(),
      });

      setTodos(todos.map(t => 
        t.id === todo.id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
      setTodos(todos.filter(t => t.id !== id));
      toast.success('Todo deleted');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete todo');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDueDate('');
  };

  const filteredTodos = todos.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? !t.completed :
      t.completed;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !todos.find(t => t.dueDate === dueDate)?.completed;
  };

  return (
    <div className="space-y-6 animate-fade-in pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Todo Lists</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track tasks and reminders
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="premium" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add new task</DialogTitle>
              <DialogDescription>
                Create a new task to track
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task *</Label>
                <Input
                  id="title"
                  placeholder="What needs to be done?"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTodo()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due date (optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="premium" onClick={handleSaveTodo} disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Task
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ListTodo className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Total</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-warning">
              <Circle className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Active</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Done</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize flex-1 sm:flex-none"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Todos list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTodos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <CheckSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground">No tasks</h3>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
              {searchQuery || filter !== 'all'
                ? 'No tasks match your criteria'
                : 'Add your first task to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map((todo) => (
            <Card key={todo.id} variant="interactive" className="group">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTodo(todo)}
                    className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                      todo.completed
                        ? 'bg-success border-success text-success-foreground'
                        : 'border-muted-foreground/30 hover:border-primary'
                    )}
                  >
                    {todo.completed && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium text-sm sm:text-base truncate',
                      todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                    )}>
                      {todo.title}
                    </p>
                    {todo.dueDate && (
                      <p className={cn(
                        'text-xs flex items-center gap-1 mt-1',
                        isOverdue(todo.dueDate) ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        <Calendar className="h-3 w-3" />
                        {new Date(todo.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}