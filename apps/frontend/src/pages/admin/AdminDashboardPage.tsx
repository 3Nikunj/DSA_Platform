import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Activity, 
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Code,
  Layers,
  GitBranch
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { AdminChart } from '../../components/admin/AdminChart';
import { AdminActivityFeed } from '../../components/admin/AdminActivityFeed';
import { AdminQuickActions } from '../../components/admin/AdminQuickActions';
import type { ChartDatum } from '../../components/admin/AdminChart';

interface ActivityItem {
  id: string;
  type: 'user' | 'submission' | 'challenge' | 'algorithm' | 'achievement';
  message: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    challenge?: string;
    algorithm?: string;
    status?: 'success' | 'failed' | 'pending';
    points?: number;
  };
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalAlgorithms: number;
  totalChallenges: number;
  totalSubmissions: number;
  submissionsToday: number;
  systemHealth: number;
  recentActivities: ActivityItem[];
  userGrowth: ChartDatum[];
  submissionTrends: ChartDatum[];
}

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalAlgorithms: 0,
    totalChallenges: 0,
    totalSubmissions: 0,
    submissionsToday: 0,
    systemHealth: 100,
    recentActivities: [],
    userGrowth: [],
    submissionTrends: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue',
      trend: '+12%',
      trendDirection: 'up'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: Activity,
      color: 'green',
      trend: '+8%',
      trendDirection: 'up'
    },
    {
      title: 'Total Algorithms',
      value: stats.totalAlgorithms.toLocaleString(),
      icon: Code,
      color: 'purple',
      trend: '+5%',
      trendDirection: 'up'
    },
    {
      title: 'Total Challenges',
      value: stats.totalChallenges.toLocaleString(),
      icon: Trophy,
      color: 'orange',
      trend: '+15%',
      trendDirection: 'up'
    },
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions.toLocaleString(),
      icon: GitBranch,
      color: 'indigo',
      trend: '+20%',
      trendDirection: 'up'
    },
    {
      title: 'Submissions Today',
      value: stats.submissionsToday.toLocaleString(),
      icon: Clock,
      color: 'red',
      trend: '+25%',
      trendDirection: 'up'
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth}%`,
      icon: stats.systemHealth >= 90 ? CheckCircle : AlertTriangle,
      color: stats.systemHealth >= 90 ? 'green' : 'red',
      trend: 'Stable',
      trendDirection: 'stable'
    },
    {
      title: 'Content Items',
      value: (stats.totalAlgorithms + stats.totalChallenges).toLocaleString(),
      icon: Layers,
      color: 'teal',
      trend: '+10%',
      trendDirection: 'up'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and manage your DSA Learning Platform
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <AdminQuickActions />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <AdminStatCard 
              key={index} 
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              trend={card.trend}
              trendDirection={card.trendDirection as 'up' | 'down' | 'stable'}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminChart
            title="User Growth"
            data={stats.userGrowth}
            type="line"
            color="blue"
            icon={LineChart}
          />
          <AdminChart
            title="Submission Trends"
            data={stats.submissionTrends}
            type="bar"
            color="purple"
            icon={BarChart3}
          />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AdminChart
            title="Content Distribution"
            data={[
              { name: 'Algorithms', value: stats.totalAlgorithms, color: '#8B5CF6' },
              { name: 'Challenges', value: stats.totalChallenges, color: '#F59E0B' },
            ]}
            type="pie"
            color="multi"
            icon={PieChart}
          />
          
          <div className="lg:col-span-2">
            <AdminActivityFeed activities={stats.recentActivities} />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.3k</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Daily Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">98%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};