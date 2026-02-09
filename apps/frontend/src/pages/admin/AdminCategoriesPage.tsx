import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Folder,
  FolderOpen,
  Code,
  BookOpen,
  Layers,
  Grid,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  parentId: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  problemCount: number;
  difficultyDistribution: {
    BEGINNER: number;
    EASY: number;
    MEDIUM: number;
    HARD: number;
    EXPERT: number;
  };
  avgSuccessRate: number;
  totalSubmissions: number;
  tags: string[];
  prerequisites: string[];
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    level: 'all',
    featured: 'all',
    hasProblems: 'all',
  });
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const filterCategories = React.useCallback(() => {
    const filtered = categories.filter(category => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && category.isActive) ||
        (filters.status === 'inactive' && !category.isActive);

      const matchesLevel =
        filters.level === 'all' || category.level.toString() === filters.level;

      const matchesFeatured =
        filters.featured === 'all' ||
        (filters.featured === 'true' && category.isFeatured) ||
        (filters.featured === 'false' && !category.isFeatured);

      const matchesHasProblems =
        filters.hasProblems === 'all' ||
        (filters.hasProblems === 'true' && category.problemCount > 0) ||
        (filters.hasProblems === 'false' && category.problemCount === 0);

      return matchesSearch && matchesStatus && matchesLevel && matchesFeatured && matchesHasProblems;
    });

    const sorted = [...filtered].sort((a, b) => {
      // Sort by name by default
      return a.name.localeCompare(b.name);
    });

    setFilteredCategories(sorted);
  }, [categories, searchTerm, filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [filterCategories]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Arrays & Strings',
          slug: 'arrays-strings',
          description:
            'Fundamental data structures for storing and manipulating collections of data',
          icon: 'Grid',
          color: '#3B82F6',
          parentId: null,
          level: 0,
          sortOrder: 1,
          isActive: true,
          isFeatured: true,
          problemCount: 156,
          difficultyDistribution: {
            BEGINNER: 45,
            EASY: 52,
            MEDIUM: 38,
            HARD: 15,
            EXPERT: 6,
          },
          avgSuccessRate: 72.5,
          totalSubmissions: 12450,
          tags: ['arrays', 'strings', 'indexing', 'iteration'],
          prerequisites: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          children: [
            {
              id: '1-1',
              name: 'Array Manipulation',
              slug: 'array-manipulation',
              description:
                'Techniques for modifying and transforming array elements',
              icon: 'Layers',
              color: '#60A5FA',
              parentId: '1',
              level: 1,
              sortOrder: 1,
              isActive: true,
              isFeatured: false,
              problemCount: 68,
              difficultyDistribution: {
                BEGINNER: 25,
                EASY: 28,
                MEDIUM: 12,
                HARD: 3,
                EXPERT: 0,
              },
              avgSuccessRate: 78.2,
              totalSubmissions: 5420,
              tags: ['sorting', 'searching', 'two-pointers'],
              prerequisites: ['Basic Arrays'],
              createdAt: '2024-01-02T00:00:00Z',
              updatedAt: '2024-01-10T08:00:00Z',
            },
            {
              id: '1-2',
              name: 'String Processing',
              slug: 'string-processing',
              description:
                'Algorithms for text manipulation and pattern matching',
              icon: 'Code',
              color: '#93C5FD',
              parentId: '1',
              level: 1,
              sortOrder: 2,
              isActive: true,
              isFeatured: false,
              problemCount: 88,
              difficultyDistribution: {
                BEGINNER: 20,
                EASY: 24,
                MEDIUM: 26,
                HARD: 12,
                EXPERT: 6,
              },
              avgSuccessRate: 68.9,
              totalSubmissions: 7030,
              tags: ['pattern-matching', 'regex', 'palindrome'],
              prerequisites: ['Basic Strings'],
              createdAt: '2024-01-03T00:00:00Z',
              updatedAt: '2024-01-12T14:00:00Z',
            },
          ],
        },
        {
          id: '2',
          name: 'Trees & Graphs',
          slug: 'trees-graphs',
          description:
            'Hierarchical and network data structures for complex relationships',
          icon: 'BookOpen',
          color: '#10B981',
          parentId: null,
          level: 0,
          sortOrder: 2,
          isActive: true,
          isFeatured: true,
          problemCount: 124,
          difficultyDistribution: {
            BEGINNER: 15,
            EASY: 35,
            MEDIUM: 45,
            HARD: 22,
            EXPERT: 7,
          },
          avgSuccessRate: 58.3,
          totalSubmissions: 8930,
          tags: ['trees', 'graphs', 'traversal', 'recursion'],
          prerequisites: ['Arrays & Strings'],
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-18T16:00:00Z',
          children: [
            {
              id: '2-1',
              name: 'Binary Trees',
              slug: 'binary-trees',
              description: 'Binary tree structures and traversal algorithms',
              icon: 'Target',
              color: '#34D399',
              parentId: '2',
              level: 1,
              sortOrder: 1,
              isActive: true,
              isFeatured: false,
              problemCount: 56,
              difficultyDistribution: {
                BEGINNER: 12,
                EASY: 24,
                MEDIUM: 16,
                HARD: 4,
                EXPERT: 0,
              },
              avgSuccessRate: 65.7,
              totalSubmissions: 4200,
              tags: ['binary-tree', 'traversal', 'bst'],
              prerequisites: ['Basic Trees'],
              createdAt: '2024-01-06T00:00:00Z',
              updatedAt: '2024-01-14T12:00:00Z',
            },
          ],
        },
        {
          id: '3',
          name: 'Dynamic Programming',
          slug: 'dynamic-programming',
          description:
            'Optimization technique for solving complex problems by breaking them down',
          icon: 'BarChart3',
          color: '#F59E0B',
          parentId: null,
          level: 0,
          sortOrder: 3,
          isActive: true,
          isFeatured: false,
          problemCount: 89,
          difficultyDistribution: {
            BEGINNER: 8,
            EASY: 22,
            MEDIUM: 35,
            HARD: 18,
            EXPERT: 6,
          },
          avgSuccessRate: 45.2,
          totalSubmissions: 6750,
          tags: ['dp', 'memoization', 'optimization'],
          prerequisites: ['Arrays', 'Recursion'],
          createdAt: '2024-01-08T00:00:00Z',
          updatedAt: '2024-01-20T18:00:00Z',
        },
        {
          id: '4',
          name: 'Sorting & Searching',
          slug: 'sorting-searching',
          description: 'Fundamental algorithms for ordering and finding data',
          icon: 'TrendingUp',
          color: '#8B5CF6',
          parentId: null,
          level: 0,
          sortOrder: 4,
          isActive: true,
          isFeatured: false,
          problemCount: 67,
          difficultyDistribution: {
            BEGINNER: 25,
            EASY: 28,
            MEDIUM: 12,
            HARD: 2,
            EXPERT: 0,
          },
          avgSuccessRate: 76.8,
          totalSubmissions: 5200,
          tags: ['sorting', 'searching', 'binary-search'],
          prerequisites: ['Arrays'],
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-22T20:00:00Z',
        },
      ];

      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string): React.ElementType => {
    const icons: { [key: string]: React.ElementType } = {
      Grid,
      Folder,
      FolderOpen,
      Code,
      BookOpen,
      Layers,
      BarChart3,
      TrendingUp,
      Users,
      Clock,
      Target,
    };
    return icons[iconName] || Folder;
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this category? This action cannot be undone.'
      )
    ) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingCategory) {
        setCategories(
          categories.map(c =>
            c.id === editingCategory.id
              ? {
                  ...editingCategory,
                  ...categoryData,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      } else {
        const newCategory: Category = {
          id: Date.now().toString(),
          name: categoryData.name || '',
          slug: categoryData.slug || '',
          description: categoryData.description || '',
          icon: categoryData.icon || 'Folder',
          color: categoryData.color || '#6B7280',
          parentId: categoryData.parentId || null,
          level: categoryData.level || 0,
          sortOrder: categoryData.sortOrder || 0,
          isActive: categoryData.isActive !== false,
          isFeatured: categoryData.isFeatured || false,
          problemCount: 0,
          difficultyDistribution: {
            BEGINNER: 0,
            EASY: 0,
            MEDIUM: 0,
            HARD: 0,
            EXPERT: 0,
          },
          avgSuccessRate: 0,
          totalSubmissions: 0,
          tags: categoryData.tags || [],
          prerequisites: categoryData.prerequisites || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCategories([...categories, newCategory]);
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const renderCategoryRow = (
    category: Category,
    isExpanded: boolean,
    level: number = 0
  ) => {
    const IconComponent = getIconComponent(category.icon);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <tr key={category.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div
            className="flex items-center"
            style={{ marginLeft: `${level * 24}px` }}
          >
            {hasChildren && (
              <button
                onClick={() => toggleCategoryExpansion(category.id)}
                className="mr-2 text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4" />
                ) : (
                  <Folder className="w-4 h-4" />
                )}
              </button>
            )}
            <div className="flex items-center">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                style={{
                  backgroundColor: category.color + '20',
                  color: category.color,
                }}
              >
                {React.createElement(IconComponent, { className: "w-4 h-4", 'aria-hidden': "true" })}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {category.name}
                </div>
                <div className="text-sm text-gray-500">{category.slug}</div>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900">{category.description}</div>
          <div className="text-xs text-gray-500 mt-1">
            {category.tags.map(tag => `#${tag}`).join(' ')}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              category.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{category.problemCount}</div>
          <div className="text-xs text-gray-500">problems</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {category.avgSuccessRate}%
          </div>
          <div className="text-xs text-gray-500">success rate</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {category.totalSubmissions.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">submissions</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditCategory(category)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderCategoryWithChildren = (category: Category) => {
    const isExpanded = expandedCategories.has(category.id);
    const rows = [renderCategoryRow(category, isExpanded, category.level)];

    if (isExpanded && category.children) {
      category.children.forEach(child => {
        rows.push(renderCategoryRow(child, false, child.level));
      });
    }

    return rows;
  };

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
            Category Management
          </h1>
          <p className="text-gray-600 mt-1">
            Organize and manage problem categories and topics
          </p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Category
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filters.level}
              onChange={e => setFilters({ ...filters, level: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="0">Root Level</option>
              <option value="1">Subcategory</option>
            </select>

            <select
              value={filters.featured}
              onChange={e =>
                setFilters({ ...filters, featured: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Featured</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>

            <select
              value={filters.hasProblems}
              onChange={e =>
                setFilters({ ...filters, hasProblems: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="true">Has Problems</option>
              <option value="false">No Problems</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problems
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map(category =>
                renderCategoryWithChildren(category)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <AdminCategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

interface AdminCategoryModalProps {
  category: Category | null;
  onSave: (category: Partial<Category>) => void;
  onClose: () => void;
}

const AdminCategoryModal: React.FC<AdminCategoryModalProps> = ({
  category,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || 'Folder',
    color: category?.color || '#6B7280',
    parentId: category?.parentId || null,
    level: category?.level || 0,
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive !== false,
    isFeatured: category?.isFeatured || false,
    tags: category?.tags || [],
    prerequisites: category?.prerequisites || [],
  });

  const [newTag, setNewTag] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');

  const iconOptions = [
    'Grid',
    'Folder',
    'FolderOpen',
    'Code',
    'BookOpen',
    'Layers',
    'BarChart3',
    'TrendingUp',
    'Users',
    'Clock',
    'Target',
  ];
  const colorOptions = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#EC4899',
    '#6366F1',
    '#14B8A6',
    '#F43F5E',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index) || [],
    });
  };

  const addPrerequisite = () => {
    if (
      newPrerequisite.trim() &&
      !formData.prerequisites?.includes(newPrerequisite.trim())
    ) {
      setFormData({
        ...formData,
        prerequisites: [
          ...(formData.prerequisites || []),
          newPrerequisite.trim(),
        ],
      });
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData({
      ...formData,
      prerequisites:
        formData.prerequisites?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {category ? 'Edit Category' : 'Create New Category'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={e =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="enter-category-slug"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the category..."
            />
          </div>

          {/* Icon and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <select
                value={formData.icon}
                onChange={e =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? 'border-gray-800'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.level}
                onChange={e =>
                  setFormData({ ...formData, level: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={e =>
                  setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={e =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag..."
                  onKeyDown={e =>
                    e.key === 'Enter' && (e.preventDefault(), addTag())
                  }
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrerequisite}
                  onChange={e => setNewPrerequisite(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a prerequisite..."
                  onKeyDown={e =>
                    e.key === 'Enter' && (e.preventDefault(), addPrerequisite())
                  }
                />
                <button
                  type="button"
                  onClick={addPrerequisite}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {formData.prerequisites?.map((prereq, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm">{prereq}</span>
                    <button
                      type="button"
                      onClick={() => removePrerequisite(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;