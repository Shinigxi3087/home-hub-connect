import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MessageInputProps {
  listingId: string;
  receiverId: string;
  onSent: () => void;
}

export function MessageInput({ listingId, receiverId, onSent }: MessageInputProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        listing_id: listingId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim()
      });

      if (error) throw error;

      setContent('');
      onSent();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="p-4 border-t border-border">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="resize-none"
          rows={2}
          disabled={sending}
        />
        <Button type="submit" disabled={!content.trim() || sending} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
