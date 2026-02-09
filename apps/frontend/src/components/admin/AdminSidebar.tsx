import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  BarChart3,
  Users,
  BookOpen,
  Trophy,
  Settings,
  LogOut,
  Shield,
  Activity,
  FileText,
  TrendingUp,
  Monitor,
  ChevronRight,
  Home,
  Code,
  Award,
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggle,
}) => {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: Home },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Algorithms', href: '/admin/algorithms', icon: Code },
    { name: 'Challenges', href: '/admin/challenges', icon: Trophy },
    { name: 'Categories', href: '/admin/categories', icon: BookOpen },
    { name: 'Submissions', href: '/admin/submissions', icon: FileText },
    { name: 'Achievements', href: '/admin/achievements', icon: Award },
    { name: 'Leaderboard', href: '/admin/leaderboard', icon: TrendingUp },
    { name: 'System Health', href: '/admin/system', icon: Monitor },
    { name: 'Activity Logs', href: '/admin/logs', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-purple-400" />
            <span className="text-lg font-bold">Admin Panel</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-gray-700 transition-colors"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map(item => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};
