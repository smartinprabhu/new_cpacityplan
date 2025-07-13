import React, { useState } from 'react';
import { BarChart3, Users, Calendar, Settings, Home } from 'lucide-react';
import DOWIntradayTab from './DOWIntradayTab';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dow-intraday');

  const tabs: TabConfig[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Home className="w-4 h-4" />,
      component: () => (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Dashboard Overview</h2>
          <p className="text-gray-400">Welcome to the Tactical Capacity Insights Dashboard</p>
        </div>
      )
    },
    {
      id: 'dow-intraday',
      label: 'DOW & Intraday',
      icon: <BarChart3 className="w-4 h-4" />,
      component: DOWIntradayTab
    },
    {
      id: 'capacity',
      label: 'Capacity Planning',
      icon: <Users className="w-4 h-4" />,
      component: () => (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Capacity Planning</h2>
          <p className="text-gray-400">Capacity planning tools and analytics</p>
        </div>
      )
    },
    {
      id: 'scheduling',
      label: 'Scheduling',
      icon: <Calendar className="w-4 h-4" />,
      component: () => (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Scheduling</h2>
          <p className="text-gray-400">Schedule management and optimization</p>
        </div>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      component: () => (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Settings</h2>
          <p className="text-gray-400">Application settings and configuration</p>
        </div>
      )
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentComponent = currentTab?.component || (() => <div>Tab not found</div>);

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Top Navigation */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                <div>
                  <h1 className="text-lg font-semibold text-white">Premium Order Services</h1>
                  <p className="text-xs text-gray-400">Some description for the premium services</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-700 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <CurrentComponent />
      </div>
    </div>
  );
};

export default Dashboard;