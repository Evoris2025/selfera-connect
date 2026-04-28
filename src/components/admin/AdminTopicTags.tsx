import { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Power, PowerOff, Save, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { toast } from 'sonner';

interface TopicTag {
  id: string;
  name: string;
  category: string | null;
  active: boolean;
  created_at: string;
}

const TAG_CATEGORIES = [
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'wellbeing', label: 'Wellbeing' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
];

export function AdminTopicTags() {
  const [tags, setTags] = useState<TopicTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<TopicTag | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<string>('other');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const { logAction } = useAuditLog();

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      // Admins can view all tags including inactive ones due to the new RLS policy
      const { data, error } = await supabase
        .from('topic_tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      toast.error('Failed to load topic tags');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('topic_tags')
        .insert({
          name: newTagName.trim().toLowerCase(),
          category: newTagCategory,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      await logAction({
        actionType: 'role_change', // Using role_change as a generic admin action
        targetEntityId: data.id,
        targetEntityType: 'topic_tags',
        newState: { name: data.name, category: data.category, active: true },
        notes: `Created topic tag: ${data.name}`,
      });

      toast.success(`Topic tag "${data.name}" created`);
      setShowCreateDialog(false);
      setNewTagName('');
      setNewTagCategory('other');
      fetchTags();
    } catch (error: any) {
      console.error('Failed to create tag:', error);
      if (error.code === '23505') {
        toast.error('A tag with this name already exists');
      } else {
        toast.error('Failed to create topic tag');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag || !newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    setIsCreating(true);
    try {
      const previousState = {
        name: editingTag.name,
        category: editingTag.category,
        active: editingTag.active,
      };

      const { error } = await supabase
        .from('topic_tags')
        .update({
          name: newTagName.trim().toLowerCase(),
          category: newTagCategory,
        })
        .eq('id', editingTag.id);

      if (error) throw error;

      await logAction({
        actionType: 'role_change',
        targetEntityId: editingTag.id,
        targetEntityType: 'topic_tags',
        previousState,
        newState: { name: newTagName.trim().toLowerCase(), category: newTagCategory, active: editingTag.active },
        notes: `Updated topic tag: ${previousState.name} → ${newTagName.trim().toLowerCase()}`,
      });

      toast.success('Topic tag updated');
      setShowEditDialog(false);
      setEditingTag(null);
      setNewTagName('');
      setNewTagCategory('other');
      fetchTags();
    } catch (error: any) {
      console.error('Failed to update tag:', error);
      if (error.code === '23505') {
        toast.error('A tag with this name already exists');
      } else {
        toast.error('Failed to update topic tag');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (tag: TopicTag) => {
    try {
      const newActive = !tag.active;
      const { error } = await supabase
        .from('topic_tags')
        .update({ active: newActive })
        .eq('id', tag.id);

      if (error) throw error;

      await logAction({
        actionType: 'role_change',
        targetEntityId: tag.id,
        targetEntityType: 'topic_tags',
        previousState: { active: tag.active },
        newState: { active: newActive },
        notes: `${newActive ? 'Enabled' : 'Disabled'} topic tag: ${tag.name}`,
      });

      toast.success(`Topic tag "${tag.name}" ${newActive ? 'enabled' : 'disabled'}`);
      fetchTags();
    } catch (error) {
      console.error('Failed to toggle tag:', error);
      toast.error('Failed to update topic tag');
    }
  };

  const openEditDialog = (tag: TopicTag) => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagCategory(tag.category || 'other');
    setShowEditDialog(true);
  };

  const filteredTags = tags.filter(tag => {
    if (filterCategory !== 'all' && tag.category !== filterCategory) return false;
    if (filterActive === 'active' && !tag.active) return false;
    if (filterActive === 'inactive' && tag.active) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Topic Tags
            </CardTitle>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Tag
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TAG_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-body text-muted-foreground ml-auto">
              {filteredTags.length} tags
            </span>
          </div>
        </CardContent>
      </Card>

      {filteredTags.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tags found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTags.map(tag => (
            <Card key={tag.id} className={!tag.active ? 'opacity-60' : ''}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={tag.active ? 'default' : 'secondary'} className="shrink-0">
                      #{tag.name}
                    </Badge>
                    {tag.category && (
                      <span className="text-label text-muted-foreground truncate">
                        {TAG_CATEGORIES.find(c => c.value === tag.category)?.label || tag.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditDialog(tag)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleToggleActive(tag)}
                    >
                      {tag.active ? (
                        <PowerOff className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <Power className="h-3.5 w-3.5 text-green-600" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Topic Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                placeholder="e.g., anxiety, mindfulness"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
              />
              <p className="text-label text-muted-foreground">
                Tag names are lowercase and should be single words or hyphenated
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagCategory">Category</Label>
              <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAG_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Topic Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTagName">Tag Name</Label>
              <Input
                id="editTagName"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTagCategory">Category</Label>
              <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAG_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTag} disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}