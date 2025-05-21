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
                      {item.name