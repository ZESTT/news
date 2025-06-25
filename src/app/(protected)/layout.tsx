
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/common/AppLogo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, FileText, Image as ImageIcon, LayoutDashboard, History, Users, SearchCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isAuthenticated, isLoading, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      toast({
        title: 'Authentication required',
        description: 'Please sign in to access this page',
        variant: 'destructive',
      });
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
             <Link href="/"><AppLogo size="md" /></Link>
             <div className="md:hidden"> {/* Hide on md and up for desktop toggle */}
                <SidebarTrigger />
             </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === '/dashboard'}
                tooltip="Dashboard Overview"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === '/dashboard/text-analysis'}
                tooltip="Fact Check Text"
              >
                <Link href="/dashboard/text-analysis">
                  <FileText className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Fact Check Text</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === '/dashboard/image-analysis'}
                tooltip="Fact Check Images"
              >
                <Link href="/dashboard/image-analysis">
                  <ImageIcon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Fact Check Images</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === '/dashboard/activity-log'}
                tooltip="View Activity Log"
              >
                <Link href="/dashboard/activity-log">
                  <History />
                  <span className="group-data-[collapsible=icon]:hidden">Activity Log</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === '/fact-check-resources'}
                tooltip="Fact-Checking Resources"
              >
                <Link href="/fact-check-resources">
                  <SearchCheck className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Fact-Checking Resources</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/dashboard/admin/users'}
                  tooltip="Manage Users"
                >
                  <Link href="/dashboard/admin/users">
                    <Users />
                    <span className="group-data-[collapsible=icon]:hidden">Admin Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4 md:hidden">
          <SidebarTrigger />
          <Link href="/"><AppLogo size="sm"/></Link>
        </header>

        {/* Desktop Top Navigation Bar */}
        <header className="sticky top-0 z-20 hidden h-16 w-full items-center justify-end border-b bg-card px-4 md:flex md:px-6">
                    <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full transition-transform duration-300 ease-in-out hover:scale-110 focus:scale-110">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(user?.email)}`} alt={user?.email ?? 'User Avatar'} data-ai-hint="profile avatar"/>
                    <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                  </Avatar>
                  {/* Active status indicator dot */}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end" forceMount> {/* Changed w-64 to w-72 */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2 py-2"> {/* Changed space-y-1 to space-y-2 */}
                    <p className="text-xs text-muted-foreground leading-none">Signed in as</p>
                    <p className="text-sm font-medium leading-none text-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

