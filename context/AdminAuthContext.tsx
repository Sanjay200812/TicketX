"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSession, AdminPermission } from '@/types/admin';
import { hasPermission } from '@/lib/admin/permissions';

interface AdminAuthContextType {
  admin: AdminSession | null;
  permissions: AdminPermission[];
  loading: boolean;
  login: (email: string, pass: string, accessKey: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPerm: (perm: AdminPermission) => boolean;
  refreshSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.admin) {
          setAdmin(data.admin);
          setPermissions(data.permissions || []);
          return;
        }
      }
      setAdmin(null);
      setPermissions([]);
    } catch {
      setAdmin(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, pass: string, accessKey: string) => {
    try {
      setLoading(true);

      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: pass,
          accessKey: accessKey.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Invalid administrative credentials.',
        };
      }

      await refreshSession();
      return { success: true };
    } catch {
      return {
        success: false,
        error: 'Invalid administrative credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAdmin(null);
      setPermissions([]);
      router.push('/admin-login');
    }
  };

  const hasPerm = useCallback(
    (perm: AdminPermission) => {
      if (!admin) return false;
      return hasPermission(admin.role, perm, permissions);
    },
    [admin, permissions]
  );

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        permissions,
        loading,
        login,
        logout,
        hasPerm,
        refreshSession,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
