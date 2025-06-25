'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, X, LayoutDashboard, User, LogIn, UserPlus } from 'lucide-react';
import { AppLogo } from '../common/AppLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogoutButton } from '../auth/LogoutButton';
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  href: string;
  auth?: boolean;
  admin?: boolean;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Demo', href: '#live-demo' },
  { label: 'Roadmap', href: '#roadmap' },
  { label: 'FAQ', href: '#faq' },
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    auth: true,
    icon: <LayoutDashboard className="h-4 w-4 mr-2" />
  },
  { 
    label: 'Admin', 
    href: '/admin', 
    admin: true,
    icon: <User className="h-4 w-4 mr-2" />
  },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Get auth state using useAuth hook
  const { user, status, hasRole } = useAuth();
  const isAdmin = hasRole ? hasRole('admin') : false;
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  
  // Filter nav items based on auth status and admin role
  const filteredNavItems = navItems.filter(item => {
    if (item.auth && !isAuthenticated) return false;
    if (item.admin && !isAdmin) return false;
    return true;
  });
  
  // Check if current route is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };
  
  // Close mobile menu
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  
  // Render mobile navigation links
  const renderMobileNavLinks = () => (
    <div className="space-y-1">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            isActive(item.href) 
              ? 'bg-accent text-accent-foreground' 
              : 'text-foreground/80 hover:bg-accent/50 hover:text-foreground'
          }`}
          onClick={closeMobileMenu}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </div>
  );
  
  // Render authentication buttons
  const renderAuthButtons = (mobile = false) => {
    
    if (isLoading) {
      return (
        <div className={`flex items-center justify-center ${mobile ? 'w-full' : ''}`}>
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className={`flex ${mobile ? 'flex-col space-y-2 w-full' : 'items-center space-x-2'}`}>
          <Button 
            asChild 
            variant={mobile ? 'outline' : 'default'} 
            size={mobile ? 'default' : 'sm'}
            className={mobile ? 'w-full' : ''}
          >
            <Link href="/dashboard" className="flex items-center">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <LogoutButton className={mobile ? 'w-full' : ''} />
        </div>
      );
    }

    return (
      <div className={`flex ${mobile ? 'flex-col space-y-2 w-full' : 'items-center space-x-2'}`}>
        <Button 
          asChild 
          variant={mobile ? 'outline' : 'ghost'} 
          size={mobile ? 'default' : 'sm'}
          className={mobile ? 'w-full' : ''}
        >
          <Link href="/auth/login" className="flex items-center">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Link>
        </Button>
        <Button 
          asChild 
          size={mobile ? 'default' : 'sm'}
          className={`${mobile ? 'w-full' : ''} bg-gradient-to-r from-primary to-secondary hover:opacity-90`}
        >
          <Link href="/auth/register" className="flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Link>
        </Button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <AppLogo size="md" href="/" />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {renderAuthButtons()}
          <ThemeToggle />
          
          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <AppLogo size="sm" />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                {renderMobileNavLinks()}
              </nav>
              <div className="border-t p-4">
                {renderAuthButtons(true)}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
