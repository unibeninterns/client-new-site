"use client";

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, X, Home, FileText, ClipboardList, BookOpen, LogOut, ChevronDown, ChevronUp 
} from 'lucide-react';

interface ResearcherLayoutProps {
  children: ReactNode;
}

export default function ResearcherLayout({ children }: ResearcherLayoutProps) {
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

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (sidebarOpen && 
          sidebar && 
          !sidebar.contains(event.target as Node) && 
          toggleButton && 
          !toggleButton.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [sidebarOpen]);

  const navigation = [
    { name: 'Dashboard', href: '/researchers/dashboard', icon: Home },
    { name: 'My Proposals', href: '/researchers/proposals', icon: FileText },
    { name: 'Submit New Proposal', href: '/researchers/submit', icon: ClipboardList },
    { name: 'Guidelines', href: '/researchers/guidelines', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div 
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-purple-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16">
          <div className="text-xl font-bold text-white">DRID Researcher</div>
          <button
            className="p-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-800 rounded-md"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-5 px-2">
          <nav className="space-y-1">
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
        
        <div className="absolute bottom-0 w-full border-t border-purple-800 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center text-purple-100 hover:text-white w-full"
          >
            <LogOut className="h-6 w-6 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main layout grid */}
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 bg-purple-900">
            {/* Sidebar Header */}
            <div className="flex h-16 flex-shrink-0 items-center px-4">
              <div className="text-xl font-bold text-white">DRID Researcher</div>
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
                        {user?.name || 'Researcher'}
                      </p>
                      <p className="text-xs font-medium text-purple-200">
                        {user?.email || 'researcher@uniben.edu'}
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
        </div>

        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between bg-white px-4 py-2 shadow-sm h-16">
              <button
                id="sidebar-toggle"
                type="button"
                className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 p-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Open sidebar"
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>
              <div className="text-lg font-semibold text-gray-900">
                DRID Researcher Portal
              </div>
              <div className="text-sm text-gray-600">
                {user?.name || 'Researcher'}
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-800 rounded-full flex items-center justify-center text-white font-bold text-xl">D</div>
                <span className="ml-2 font-semibold text-xl text-purple-800">DRID</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome,</span>
                <span className="font-medium text-purple-800">{user?.name || 'Researcher'}</span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                  Researcher
                </span>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}