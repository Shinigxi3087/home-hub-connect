import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import { Home, Heart, MessageSquare, Bell, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Header = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
    navigate('/auth');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">HomeFinder</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" asChild>
              <Link to="/">Buy</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/favorites">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/messages">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </Link>
            </Button>
          </nav>

          <div className="flex items-center space-x-4">
            {roles.includes('seller') && (
              <Button asChild>
                <Link to="/dashboard/seller">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            )}
            
            {roles.includes('admin') && (
              <Button asChild variant="secondary">
                <Link to="/dashboard/admin">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" asChild>
              <Link to="/notifications">
                <Bell className="w-5 h-5" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email ? getInitials(user.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
