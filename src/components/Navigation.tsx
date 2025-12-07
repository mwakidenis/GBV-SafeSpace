import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle, BookOpen, ChevronDown, Heart, Lock, LogOut, Mail, Menu, MessageCircle, Settings, Shield, User, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Number of primary nav items to show on tablet before "More" menu
const TABLET_VISIBLE_NAV_ITEMS = 3;

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Primary navigation items - always visible
  const primaryNavItems = [
    { path: "/", label: "Home", icon: Shield },
    { path: "/learn", label: "Learn", icon: BookOpen },
    { path: "/detect", label: "AI Detector", icon: AlertCircle },
    { path: "/support", label: "Support", icon: Heart },
  ];

  // Community features - shown in dropdown when logged in
  const communityItems = [
    { path: "/forum", label: "Community Forum", icon: MessageCircle },
    { path: "/messages", label: "Private Messages", icon: Mail },
  ];

  // Account/user items - shown in user dropdown when logged in
  const accountItems = [
    { path: "/profile", label: "My Profile", icon: User },
    { path: "/evidence", label: "Evidence Locker", icon: Lock },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isCommunityActive = communityItems.some(item => isActive(item.path));
  const isAccountActive = accountItems.some(item => isActive(item.path));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/favicon.svg" alt="HERA SafeSpace" className="h-8 w-8" />
            <span className="font-bold text-xl hidden sm:block">
              HERA <span className="text-primary">SafeSpace</span>
            </span>
          </Link>

          {/* 
            Desktop Navigation (lg+): Full navigation with dropdowns
            Uses lg breakpoint (1024px+) to ensure enough space for all nav items with dropdowns
          */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Primary Navigation */}
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="gap-2"
                    size="sm"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Community Dropdown - visible to all, but messages require auth */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={isCommunityActive ? "default" : "ghost"} 
                  className="gap-2"
                  size="sm"
                >
                  <Users className="h-4 w-4" />
                  Community
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Community Features</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/forum">
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Community Forum
                  </DropdownMenuItem>
                </Link>
                {user && (
                  <Link to="/messages">
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <Mail className="h-4 w-4" />
                      Private Messages
                    </DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Account Dropdown or Login Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={isAccountActive ? "default" : "ghost"} 
                    className="gap-2"
                    size="sm"
                  >
                    <User className="h-4 w-4" />
                    Account
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.path} to={item.path}>
                        <DropdownMenuItem className="cursor-pointer gap-2">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive" 
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="gap-2" size="sm">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* 
            Tablet Navigation (md to lg): Condensed nav with "More" dropdown
            Shows first few primary items directly, rest in dropdown
          */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            {primaryNavItems.slice(0, TABLET_VISIBLE_NAV_ITEMS).map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="gap-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            
            {/* More menu for tablet */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Menu className="h-4 w-4" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Features</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/support">
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <Heart className="h-4 w-4" />
                    Support
                  </DropdownMenuItem>
                </Link>
                <Link to="/forum">
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Forum
                  </DropdownMenuItem>
                </Link>
                {user && (
                  <>
                    <Link to="/messages">
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Mail className="h-4 w-4" />
                        Messages
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    {accountItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.path} to={item.path}>
                          <DropdownMenuItem className="cursor-pointer gap-2">
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </DropdownMenuItem>
                        </Link>
                      );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer gap-2 text-destructive focus:text-destructive" 
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                )}
                {!user && (
                  <>
                    <DropdownMenuSeparator />
                    <Link to="/auth">
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <User className="h-4 w-4" />
                        Login
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-1 animate-in slide-in-from-top border-t">
            {/* Primary Section */}
            <div className="pb-2">
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                      size="sm"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Community Section */}
            <div className="py-2 border-t">
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Community</p>
              <Link to="/forum" onClick={() => setIsOpen(false)}>
                <Button
                  variant={isActive("/forum") ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Community Forum
                </Button>
              </Link>
              {user && (
                <Link to="/messages" onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive("/messages") ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    size="sm"
                  >
                    <Mail className="h-4 w-4" />
                    Private Messages
                  </Button>
                </Link>
              )}
            </div>

            {/* Account Section */}
            {user ? (
              <div className="py-2 border-t">
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className="w-full justify-start gap-2"
                        size="sm"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                <Button 
                  variant="ghost" 
                  onClick={() => { signOut(); setIsOpen(false); }} 
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  size="sm"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="pt-2 border-t">
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="default" className="w-full justify-start gap-2" size="sm">
                    <User className="h-4 w-4" />
                    Login / Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
