"use client";

import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider userType="admin">
      {children}
    </AuthProvider>
  );
}