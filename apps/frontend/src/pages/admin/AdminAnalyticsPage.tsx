import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Code,
  Trophy,
  Clock,
  Target,
  Activity,
} from 'lucide-react';
import { AdminStatCard } from '../../components/admin/AdminStatCard';

interface AnalyticsData {
  userGrowth: Array<{
    date: string;
    users: number;
    activeUsers: number;
    newUsers: number;
  }>;
  algorithmPerformance: Array<{
    name: string;
    submissions: number;
    avgTime: number;
    successRate: number;
  }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
  difficultyDistribution: Array<{
    difficulty: string;
    count: number;
    avgScore: number;
  }>;
  monthlyStats: Array<{
    month: string;
    submissions: number;
    users: number;
    challenges: number;
  }>;
  userEngagement: Array<{
    hour: number;
    activeUsers: number;
    submissions: number;
  }>;
  platformMetrics: {
    totalSubmissions: number;
    avgSubmissionTime: number;
    successRate: number;
    userRetention: number;
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
  };
}

const AdminAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: [],
    algorithmPerformance: [],
    categoryDistribution: [],
    difficultyDistribution: [],
    monthlyStats: [],
    userEngagement: [],
    platformMetrics: {
      totalSubmissions: 0,
      avgSubmissionTime: 0,
      successRate: 0,
      userRetention: 0,
      dailyActiveUsers: 0,
      monthlyActiveUsers: 0,
    },
  });

  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: AnalyticsData = {
        userGrowth: [
          { date: '2024-01-01', users: 1200, activeUsers: 800, newUsers: 45 },
          { date: '2024-01-08', users: 1250, activeUsers: 850, newUsers: 52 },
          { date: '2024-01-15', users: 1300, activeUsers: 900, newUsers: 48 },
          { date: '2024-01-22', users: 1380, activeUsers: 950, newUsers: 65 },
          { date: '2024-01-29', users: 1450, activeUsers: 1000, newUsers: 58 },
          { date: '2024-02-05', users: 1520, activeUsers: 1050, newUsers: 62 },
          { date: '2024-02-12', users: 1600, activeUsers: 1100, newUsers: 70 },
        ],
        algorithmPerformance: [
          { name: 'Two Sum', submissions: 450, avgTime: 12.5, successRate: 78 },
          {
            name: 'Binary Search',
            submissions: 380,
            avgTime: 18.2,
            successRate: 65,
          },
          {
            name: 'Merge Sort',
            submissions: 320,
            avgTime: 25.8,
            successRate: 52,
          },
          {
            name: 'Quick Sort',
            submissions: 290,
            avgTime: 22.1,
            successRate: 48,
          },
          { name: 'DFS', submissions: 420, avgTime: 15.3, successRate: 71 },
          { name: 'BFS', submissions: 350, avgTime: 16.7, successRate: 68 },
          {
            name: 'DP - Fibonacci',
            submissions: 280,
            avgTime: 28.9,
            successRate: 45,
          },
          {
            name: 'Graph - Shortest Path',
            submissions: 200,
            avgTime: 35.2,
            successRate: 38,
          },
        ],
        categoryDistribution: [
          { name: 'Arrays', value: 25, color: '#3B82F6' },
          { name: 'Strings', value: 20, color: '#10B981' },
          { name: 'Trees', value: 18, color: '#F59E0B' },
          { name: 'Graphs', value: 15, color: '#EF4444' },
          { name: 'Dynamic Programming', value: 12, color: '#8B5CF6' },
          { name: 'Sorting', value: 10, color: '#06B6D4' },
        ],
        difficultyDistribution: [
          { difficulty: 'Beginner', count: 45, avgScore: 85 },
          { difficulty: 'Easy', count: 38, avgScore: 72 },
          { difficulty: 'Medium', count: 25, avgScore: 58 },
          { difficulty: 'Hard', count: 15, avgScore: 42 },
          { difficulty: 'Expert', count: 8, avgScore: 28 },
        ],
        monthlyStats: [
          { month: 'Jan', submissions: 2400, users: 1200, challenges: 85 },
          { month: 'Feb', submissions: 2800, users: 1350, challenges: 92 },
          { month: 'Mar', submissions: 3200, users: 1480, challenges: 98 },
          { month: 'Apr', submissions: 3600, users: 1620, challenges: 105 },
          { month: 'May', submissions: 4100, users: 1800, challenges: 112 },
          { month: 'Jun', submissions: 4500, users: 1950, challenges: 125 },
        ],
        userEngagement: [
          { hour: 0, activeUsers: 45, submissions: 12 },
          { hour: 4, activeUsers: 25, submissions: 8 },
          { hour: 8, activeUsers: 180, submissions: 85 },
          { hour: 12, activeUsers: 320, submissions: 145 },
          { hour: 16, activeUsers: 280, submissions: 120 },
          { hour: 20, activeUsers: 350, submissions: 165 },
          { hour: 23, activeUsers: 120, submissions: 35 },
        ],
        platformMetrics: {
          totalSubmissions: 15680,
          avgSubmissionTime: 18.5,
          successRate: 62.3,
          userRetention: 78.5,
          dailyActiveUsers: 1250,
          monthlyActiveUsers: 4200,
        },
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const platformStats = [
    {
      title: 'Total Submissions',
      value: analyticsData.platformMetrics.totalSubmissions.toLocaleString(),
      icon: Code,
      color: 'blue',
      trend: '+12.5%',
      description: 'All-time code submissions',
    },
    {
      title: 'Avg Submission Time',
      value: `${analyticsData.platformMetrics.avgSubmissionTime}m`,
      icon: Clock,
      color: 'green',
      trend: '-8.2%',
      description: 'Average time to solve',
    },
    {
      title: 'Success Rate',
      value: `${analyticsData.platformMetrics.successRate}%`,
      icon: Target,
      color: 'yellow',
      trend: '+5.1%',
      description: 'Overall success rate',
    },
    {
      title: 'User Retention',
      value: `${analyticsData.platformMetrics.userRetention}%`,
      icon: Trophy,
      color: 'purple',
      trend: '+3.7%',
      description: '30-day retention rate',
    },
    {
      title: 'Daily Active Users',
      value: analyticsData.platformMetrics.dailyActiveUsers.toLocaleString(),
      icon: Activity,
      color: 'red',
      trend: '+15.3%',
      description: 'Active today',
    },
    {
      title: 'Monthly Active Users',
      value: analyticsData.platformMetrics.monthlyActiveUsers.toLocaleString(),
      icon: Users,
      color: 'indigo',
      trend: '+22.1%',
      description: 'Active this month',
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive platform insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platformStats.map((stat, index) => (
          <AdminStatCard key={index} {...stat} />
        ))}
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          User Growth Trends
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="users"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="Total Users"
            />
            <Area
              type="monotone"
              dataKey="activeUsers"
              stackId="2"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Active Users"
            />
            <Area
              type="monotone"
              dataKey="newUsers"
              stackId="3"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.6}
              name="New Users"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Algorithm Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Algorithm Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.algorithmPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="submissions" fill="#3B82F6" name="Submissions" />
              <Bar
                dataKey="successRate"
                fill="#10B981"
                name="Success Rate (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Problem Categories
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent! * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Monthly Statistics
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="submissions"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Submissions"
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#10B981"
                strokeWidth={2}
                name="Active Users"
              />
              <Line
                type="monotone"
                dataKey="challenges"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Challenges"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Engagement by Hour */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            User Engagement by Hour
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.userEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activeUsers" fill="#3B82F6" name="Active Users" />
              <Bar dataKey="submissions" fill="#10B981" name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Difficulty Distribution Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Performance by Difficulty Level
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problems
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.difficultyDistribution.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.difficulty === 'Beginner'
                          ? 'bg-green-100 text-green-800'
                          : item.difficulty === 'Easy'
                            ? 'bg-blue-100 text-blue-800'
                            : item.difficulty === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : item.difficulty === 'Hard'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.avgScore}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.avgScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {item.avgScore}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;