import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  listing_id: string;
  listing: {
    title: string;
    images: string[];
  };
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No messages yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {conversations.map((conv) => (
          <button
            key={conv.listing_id}
            onClick={() => onSelect(conv.listing_id)}
            className={`w-full p-4 text-left hover:bg-accent transition-colors ${
              selectedId === conv.listing_id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex gap-3">
              <img
                src={conv.listing.images[0] || '/placeholder.svg'}
                alt={conv.listing.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {conv.listing.title}
                  </h3>
                  {conv.unread_count > 0 && (
                    <Badge variant="default" className="ml-2 shrink-0">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {conv.other_user_name}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {conv.last_message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
