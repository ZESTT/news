
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/lib/types'; // Renamed to avoid conflict

export default function AdminUsersPage() {
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (isAdmin && user?.email) {
      setIsLoadingPage(true);
      try {
        const response = await fetch(`/api/admin/users?currentUserEmail=${encodeURIComponent(user.email)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch users');
        }
        const fetchedUsers: UserType[] = await response.json();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: (error as Error).message || "Could not load users.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPage(false);
      }
    } else {
      setIsLoadingPage(false); // Not admin or no user email
    }
  }, [isAdmin, user?.email, toast]);

  // Redirect to login if not authenticated (handled by middleware, but good practice to check)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.replace('/dashboard'); // Redirect non-admins
        toast({
          title: "Access Denied",
          description: "You do not have permission to view this page.",
          variant: "destructive",
        });
      } else {
        // Only fetch users if the user is an admin
        fetchUsers();
      }
    }
  }, [isAdmin, authLoading, router, toast, fetchUsers]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  if (authLoading || isLoadingPage) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    // This should ideally be caught by the redirect, but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-headline">Registered Users</CardTitle>
          </div>
          <CardDescription>
            List of all users registered in the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-10">
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users registered yet.</p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh] rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[200px]">Registered On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((registeredUser) => (
                    <TableRow key={registeredUser.id}>
                      <TableCell className="font-medium">{registeredUser.email}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(registeredUser.created_at), "PPpp")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

