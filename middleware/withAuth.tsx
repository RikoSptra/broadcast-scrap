"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AuthState } from '@/types/auth';
import { Loader2 } from 'lucide-react';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const [authState, setAuthState] = useState<AuthState>({
      user: null,
      isAuthenticated: false,
      isLoading: true
    });

    useEffect(() => {
      checkAuth();
    }, []);

    const checkAuth = async () => {
      try {
        const user = await auth.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      }
    };

    if (authState.isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      );
    }

    if (!authState.isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 