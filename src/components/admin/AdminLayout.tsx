"use client";

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, X, Home, FileText, LogOut, ChevronDown, ChevronUp 
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    // The redirect is handled in the logout function
  };

  // Close sidebar when route changes (on mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'All Proposals', href: '/admin/proposals', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          {/* Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0" onClick={() => setSidebarOpen(false)}>
              <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
            </div>
          )}

          {/* Sidebar */}
          <div
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed inset-y-0 left-0 w-64 transition duration-300 transform bg-purple-900 overflow-y-auto`}
          >
            <div className="flex items-center justify-between flex-shrink-0 px-4 h-16">
              <div className="text-xl font-bold text-white">DRID Admin</div>
              <button
                className="p-1 text-white focus:outline-none focus:bg-purple-800 rounded-md"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-5 flex-1 px-2">
              <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        pathname === item.href
                          ? 'bg-purple-800 text-white'
                          : 'text-purple-100 hover:bg-purple-800'
                      } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    >
                      <Icon className="mr-3 h-6 w-6" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 border-t border-purple-800 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center text-purple-100 hover:text-white"
              >
                <LogOut className="h-6 w-6 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col h-screen">
        <div className="flex min-h-0 flex-1">
          <div className="w-64 bg-purple-900 flex flex-col">
            {/* Sidebar Header */}
            <div className="flex h-16 flex-shrink-0 items-center px-4">
              <div className="text-xl font-bold text-white">DRID Admin</div>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        pathname === item.href
                          ? 'bg-purple-800 text-white'
                          : 'text-purple-100 hover:bg-purple-800'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* User Profile */}
            <div className="flex flex-shrink-0 border-t border-purple-800 p-4">
              <div className="group w-full flex flex-col">
                <button 
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setSubmenuOpen(!submenuOpen)}
                >
                  <div className="flex items-center">
                    <div className="ml-1">
                      <p className="text-sm font-medium text-white">
                        {user?.name || 'Admin User'}
                      </p>
                      <p className="text-xs font-medium text-purple-200">
                        {user?.email || 'admin@uniben.edu'}
                      </p>
                    </div>
                  </div>
                  {submenuOpen ? (
                    <ChevronUp className="h-5 w-5 text-purple-300" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-purple-300" />
                  )}
                </button>
                
                {submenuOpen && (
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center rounded-md py-2 pl-9 pr-2 text-sm font-medium text-purple-100 hover:bg-purple-800 hover:text-white"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200">
              <button
                type="button"
                className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex flex-1 justify-between px-4">
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold text-gray-900">
                    DRID Admin Portal
                  </h1>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <main className="flex-1">
              <div className="py-6">
                <div className="mx-auto px-4 sm:px-6 md:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4 items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                DRID Admin Portal
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              {user?.name || 'Admin'}
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}