import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserTagPicker } from '@/components/creator/UserTagPicker';
import type { FeedTaggedPerson } from '@/components/feed/CrossroadFeed';

interface WithPeoplePickerProps {
  value: FeedTaggedPerson[];
  onChange: (value: FeedTaggedPerson[]) => void;
}

export function WithPeoplePicker({ value, onChange }: WithPeoplePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (user: { id: string; name: string; handle: string; avatar: string }) => {
    if (value.some(v => v.id === user.id)) return;
    onChange([...value, { id: user.id, name: user.name, handle: user.handle, avatar: user.avatar }]);
  };

  const remove = (id: string) => onChange(value.filter(v => v.id !== id));

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <UserPlus className="h-4 w-4" />
        With
      </Button>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 w-full">
          {value.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 text-xs"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={p.avatar} alt={p.name} />
                <AvatarFallback className="text-[10px]">{p.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{p.name}</span>
              <button onClick={() => remove(p.id)} className="p-0.5 rounded-full hover:bg-blue-500/20">
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <UserTagPicker isOpen={open} onClose={() => setOpen(false)} onSelect={handleSelect} />
    </>
  );
}
