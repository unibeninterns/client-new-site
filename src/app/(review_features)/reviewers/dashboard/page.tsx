"use client"
import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Eye, Edit3 as Review } from 'lucide-react';
import Link from 'next/link';
import ReviewerLayout from '@/components/reviewers/ReviewerLayout';

// Define types for proposal data
interface Proposal {
  id: number;
  title: string;
  field: string;
  dateAssigned: string;
  status: 'Pending' | 'In Progress' | 'Reviewed';
}

const ReviewersDashboard: React.FC = () => {
  const [selectedDateFilter, setSelectedDateFilter] = useState('allDates');
  // Sample data - in a real app, this would come from an API or state management
  const [proposals, setProposals] = useState<Proposal[]>([
    { 
      id: 1, 
      title: 'Lorem ipsum', 
      field: 'Lorem ipsum', 
      dateAssigned: 'May 12, 2025', 
      status: 'Pending' 
    },
    { 
      id: 2, 
      title: 'Lorem ipsum', 
      field: 'Lorem ipsum', 
      dateAssigned: 'May 15, 2025', 
      status: 'In Progress' 
    },
    { 
      id: 3, 
      title: 'Lorem ipsum', 
      field: 'Lorem ipsum', 
      dateAssigned: 'May 1, 2025', 
      status: 'In Progress' 
    },
    { 
      id: 4, 
      title: 'Lorem ipsum', 
      field: 'Lorem ipsum', 
      dateAssigned: 'May 19, 2025', 
      status: 'Reviewed' 
    }
  ]);

  // Filter proposals based on date
  const filteredProposals = useMemo(() => {
    const currentDate = new Date();
    
    return proposals.filter(proposal => {
      const proposalDate = new Date(proposal.dateAssigned);
      
      switch(selectedDateFilter) {
        case 'last24h':
          const last24Hours = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));
          return proposalDate >= last24Hours;
          
        case 'last7days':
          const last7Days = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
          return proposalDate >= last7Days;
          
        case 'last1month':
          const lastMonth = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
          return proposalDate >= lastMonth;
          
        case 'mostRecent':
          return true; // We'll sort these later
          
        default: // allDates
          return true;
      }
    }).sort((a, b) => {
      // If mostRecent is selected, sort by date (newest first)
      if (selectedDateFilter === 'mostRecent') {
        return new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime();
      }
      return 0;
    });
  }, [proposals, selectedDateFilter]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-pink-100 text-pink-800';
      case 'In Progress': return 'bg-purple-100 text-purple-800';
      case 'Reviewed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ReviewerLayout>
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-700 text-center my-3">Reviewer&apos;s Dashboard</h1>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-grow">
            <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Field Dropdown */}
            <div className="relative">
            <select 
                className="w-full appearance-none pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <option value="allFields">All Fields</option>
                <option value="Reviewed">Reviewed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Date Dropdown */}
            <div className="relative">
            <select 
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <option value="allDates">All Dates</option>
                <option value="last24h">Last 24 Hours</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last1month">Last 1 Month</option>
                <option value="mostRecent">Most Recent First</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
        </div>

        {/* Proposals Table */}
        <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
                <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">{proposal.title}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{proposal.field}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{proposal.dateAssigned}</td>
                    <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                    </span>
                    </td>
                    <td className="px-4 py-4">
                    {proposal.status === "Reviewed" ? <Link href={"./dashboard/proposal"} 
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-gray-700 transition-colors flex w-max"
                    >
                      <Eye size={16} className="mr-2"/> View
                    </Link> : <Link href={"./dashboard/proposal"} 
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-purple-700 transition-colors flex w-max"
                    >
                      <Review size={16} className="mr-2"/> Review Now
                    </Link>}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
    </ReviewerLayout>
  );
};

export default ReviewersDashboard;