import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { Message, Listing } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Conversation {
  listing_id: string;
  listing: Listing;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchConversations();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch all messages involving the user
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          listing:listings(*),
          sender:profiles!messages_sender_id_fkey(id, full_name),
          receiver:profiles!messages_receiver_id_fkey(id, full_name)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by listing
      const conversationMap = new Map<string, Conversation>();

      messages?.forEach((msg: any) => {
        const listingId = msg.listing_id;
        const isReceiver = msg.receiver_id === user.id;
        const otherUserId = isReceiver ? msg.sender_id : msg.receiver_id;
        const otherUserName = isReceiver ? msg.sender.full_name : msg.receiver.full_name;

        if (!conversationMap.has(listingId)) {
          conversationMap.set(listingId, {
            listing_id: listingId,
            listing: msg.listing,
            other_user_id: otherUserId,
            other_user_name: otherUserName,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: isReceiver && !msg.is_read ? 1 : 0
          });
        } else {
          const conv = conversationMap.get(listingId)!;
          if (isReceiver && !msg.is_read) {
            conv.unread_count++;
          }
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <div className="lg:col-span-1 bg-card rounded-lg border border-border overflow-hidden">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation}
              onSelect={setSelectedConversation}
            />
          </div>
          
          <div className="lg:col-span-2 bg-card rounded-lg border border-border overflow-hidden">
            {selectedConversation ? (
              <MessageThread
                listingId={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
