import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface Algorithm {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  difficulty: 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  prerequisites: string[];
  examples: string[];
  hints: string[];
  solution: string;
  testCases: {
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }[];
}

interface AdminAlgorithmModalProps {
  isOpen: boolean;
  onClose: () => void;
  algorithm: Algorithm | null;
  onSave: () => void;
}

export const AdminAlgorithmModal: React.FC<AdminAlgorithmModalProps> = ({ 
  isOpen, 
  onClose, 
  algorithm, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Algorithm>({
    title: '',
    slug: '',
    description: '',
    content: '',
    difficulty: 'MEDIUM',
    category: '',
    timeComplexity: '',
    spaceComplexity: '',
    tags: [],
    isActive: true,
    isFeatured: false,
    prerequisites: [],
    examples: [],
    hints: [],
    solution: '',
    testCases: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newTestCase, setNewTestCase] = useState({ input: '', expectedOutput: '', isPublic: true });

  useEffect(() => {
    if (algorithm) {
      setFormData(algorithm);
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        content: '',
        difficulty: 'MEDIUM',
        category: '',
        timeComplexity: '',
        spaceComplexity: '',
        tags: [],
        isActive: true,
        isFeatured: false,
        prerequisites: [],
        examples: [],
        hints: [],
        solution: '',
        testCases: []
      });
    }
  }, [algorithm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = algorithm ? `/api/admin/algorithms/${algorithm.id}` : '/api/admin/algorithms';
      const method = algorithm ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        onSave();
      } else {
        console.error('Error saving algorithm:', data.message);
      }
    } catch (error) {
      console.error('Error saving algorithm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
      setFormData({ ...formData, prerequisites: [...formData.prerequisites, newPrerequisite.trim()] });
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prerequisiteToRemove: string) => {
    setFormData({ ...formData, prerequisites: formData.prerequisites.filter(prereq => prereq !== prerequisiteToRemove) });
  };

  const addExample = () => {
    if (newExample.trim()) {
      setFormData({ ...formData, examples: [...formData.examples, newExample] });
      setNewExample('');
    }
  };

  const removeExample = (index: number) => {
    setFormData({ ...formData, examples: formData.examples.filter((_, i) => i !== index) });
  };

  const addHint = () => {
    if (newHint.trim()) {
      setFormData({ ...formData, hints: [...formData.hints, newHint.trim()] });
      setNewHint('');
    }
  };

  const removeHint = (index: number) => {
    setFormData({ ...formData, hints: formData.hints.filter((_, i) => i !== index) });
  };

  const addTestCase = () => {
    if (newTestCase.input.trim() && newTestCase.expectedOutput.trim()) {
      setFormData({ ...formData, testCases: [...formData.testCases, newTestCase] });
      setNewTestCase({ input: '', expectedOutput: '', isPublic: true });
    }
  };

  const removeTestCase = (index: number) => {
    setFormData({ ...formData, testCases: formData.testCases.filter((_, i) => i !== index) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {algorithm ? 'Edit Algorithm' : 'Add New Algorithm'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (!algorithm) {
                      setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as typeof formData.difficulty })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Category</option>
                  <option value="arrays">Arrays</option>
                  <option value="strings">Strings</option>
                  <option value="linked-lists">Linked Lists</option>
                  <option value="trees">Trees</option>
                  <option value="graphs">Graphs</option>
                  <option value="dynamic-programming">Dynamic Programming</option>
                  <option value="sorting">Sorting</option>
                  <option value="searching">Searching</option>
                  <option value="hash-tables">Hash Tables</option>
                  <option value="stacks-queues">Stacks & Queues</option>
                  <option value="recursion">Recursion</option>
                  <option value="backtracking">Backtracking</option>
                  <option value="greedy">Greedy</option>
                  <option value="bit-manipulation">Bit Manipulation</option>
                  <option value="math">Mathematics</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Complexity
                </label>
                <input
                  type="text"
                  placeholder="e.g., O(n), O(n log n), O(n²)"
                  value={formData.timeComplexity}
                  onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Space Complexity
                </label>
                <input
                  type="text"
                  placeholder="e.g., O(1), O(n), O(n²)"
                  value={formData.spaceComplexity}
                  onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detailed Content *
              </label>
              <textarea
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Write the detailed explanation of the algorithm here..."
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tags</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Prerequisites</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add a prerequisite"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addPrerequisite}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.prerequisites.map((prerequisite, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {prerequisite}
                    <button
                      type="button"
                      onClick={() => removePrerequisite(prerequisite)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Examples */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Examples</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Example"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                type="button"
                onClick={addExample}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Example
              </button>
              
              {formData.examples.length > 0 && (
                <div className="space-y-3">
                  {formData.examples.map((example, index) => (
                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded flex-1">{example}</div>
                        <button
                          type="button"
                          onClick={() => removeExample(index)}
                          className="ml-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hints */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Hints</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add a hint"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHint())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addHint}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {formData.hints.map((hint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <span className="text-sm">{hint}</span>
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Solution */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Solution</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Complete Solution *
              </label>
              <textarea
                required
                rows={8}
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Write the complete solution with code examples..."
              />
            </div>
          </div>

          {/* Test Cases */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Test Cases</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Input"
                  value={newTestCase.input}
                  onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="Expected Output"
                  value={newTestCase.expectedOutput}
                  onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newTestCase.isPublic}
                    onChange={(e) => setNewTestCase({ ...newTestCase, isPublic: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
                </label>
              </div>
              <button
                type="button"
                onClick={addTestCase}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Test Case
              </button>
              
              {formData.testCases.length > 0 && (
                <div className="space-y-3">
                  {formData.testCases.map((testCase, index) => (
                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Input</label>
                          <div className="text-sm font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">{testCase.input}</div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expected Output</label>
                          <div className="text-sm font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">{testCase.expectedOutput}</div>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            testCase.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {testCase.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Test Case
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Saving...' : 'Save Algorithm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};