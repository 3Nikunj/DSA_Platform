import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Get all algorithms with filtering and pagination
 */
export const getAlgorithms = async (req: Request, res: Response) => {
  try {
    // Mock data for now
    const mockData = {
      items: [
        {
          id: 'alg-1',
          title: 'Two Sum',
          description: 'Find two numbers in an array that add up to a target sum',
          difficulty: 'EASY',
          category: {
            id: 'cat-1',
            name: 'Arrays',
            slug: 'arrays',
          },
          tags: ['array', 'hash-table'],
          viewCount: 1250,
          averageRating: 4.2,
          _count: {
            progress: 850,
            submissions: 1200,
          },
        },
        {
          id: 'alg-2',
          title: 'Binary Search',
          description: 'Search for a target value in a sorted array',
          difficulty: 'MEDIUM',
          category: {
            id: 'cat-2',
            name: 'Searching',
            slug: 'searching',
          },
          tags: ['binary-search', 'divide-conquer'],
          viewCount: 980,
          averageRating: 4.5,
          _count: {
            progress: 650,
            submissions: 890,
          },
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 150,
        pages: 8,
      },
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting algorithms:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get algorithm by slug
 */
export const getAlgorithmBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Mock data for now - in real implementation, search by slug
    const mockData = {
      id: 'alg-1',
      slug: slug,
      title: 'Two Sum',
      description: 'Find two numbers in an array that add up to a target sum',
      difficulty: 'EASY',
      category: {
        id: 'cat-1',
        name: 'Arrays',
        slug: 'arrays',
        description: 'Array manipulation and algorithms',
      },
      tags: ['array', 'hash-table'],
      viewCount: 1250,
      averageRating: 4.2,
      explanation: 'This is a classic problem that can be solved using a hash table...',
      examples: [
        {
          input: '[2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9'
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      _count: {
        progress: 850,
        submissions: 1200,
      },
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting algorithm by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get algorithm by ID
 */
export const getAlgorithmById = async (req: Request, res: Response) => {
  try {
    const { algorithmId } = req.params;
    
    // Mock data for now
    const mockData = {
      id: algorithmId,
      title: 'Two Sum',
      description: 'Find two numbers in an array that add up to a target sum',
      difficulty: 'EASY',
      category: {
        id: 'cat-1',
        name: 'Arrays',
        slug: 'arrays',
        description: 'Array manipulation and algorithms',
      },
      tags: ['array', 'hash-table'],
      viewCount: 1250,
      averageRating: 4.2,
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      examples: [
        {
          input: '[2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
      ],
      _count: {
        progress: 850,
        submissions: 1200,
      },
      userProgress: null,
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting algorithm by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get algorithm categories
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    // Mock data for now
    const mockData = [
      {
        id: 'cat-1',
        name: 'Arrays',
        slug: 'arrays',
        description: 'Array manipulation and algorithms',
        _count: {
          algorithms: 25,
        },
      },
      {
        id: 'cat-2',
        name: 'Strings',
        slug: 'strings',
        description: 'String manipulation algorithms',
        _count: {
          algorithms: 20,
        },
      },
      {
        id: 'cat-3',
        name: 'Searching',
        slug: 'searching',
        description: 'Search algorithms and techniques',
        _count: {
          algorithms: 15,
        },
      },
    ];

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Start algorithm (create or update progress)
 */
export const startAlgorithm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;

    // Mock data for now
    const mockData = {
      id: 'progress-1',
      userId,
      algorithmId,
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      algorithm: {
        id: algorithmId,
        title: 'Two Sum',
        difficulty: 'EASY',
      },
    };

    res.json({
      success: true,
      message: 'Algorithm started successfully',
      data: mockData,
    });
  } catch (error) {
    console.error('Error starting algorithm:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Complete algorithm
 */
export const completeAlgorithm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;
    const { timeSpent, notes } = req.body;

    // Mock data for now
    const mockData = {
      id: 'progress-1',
      userId,
      algorithmId,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      timeSpent: timeSpent || 0,
      notes,
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'Algorithm completed successfully',
      data: mockData,
    });
  } catch (error) {
    console.error('Error completing algorithm:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Submit code for algorithm
 */
export const submitCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;
    const { code, language, timeComplexity, spaceComplexity } = req.body;

    // Mock submission result
    const isCorrect = Math.random() > 0.3; // 70% success rate for simulation
    const status = isCorrect ? 'ACCEPTED' : 'WRONG_ANSWER';
    const executionTime = Math.floor(Math.random() * 1000) + 100;
    const memoryUsed = Math.floor(Math.random() * 50) + 10;

    const mockData = {
      id: 'submission-1',
      userId,
      algorithmId,
      code,
      language,
      status,
      executionTime,
      memoryUsed,
      timeComplexity,
      spaceComplexity,
      createdAt: new Date().toISOString(),
      algorithm: {
        id: algorithmId,
        title: 'Two Sum',
        difficulty: 'EASY',
      },
    };

    res.json({
      success: true,
      message: 'Code submitted successfully',
      data: mockData,
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get user's submissions for an algorithm
 */
export const getAlgorithmSubmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;

    // Mock data for now
    const mockData = {
      items: [
        {
          id: 'submission-1',
          code: 'function twoSum(nums, target) { /* implementation */ }',
          language: 'javascript',
          status: 'ACCEPTED',
          executionTime: 120,
          memoryUsed: 15,
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting algorithm submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get algorithm progress
 */
export const getAlgorithmProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;

    // Mock data for now
    const mockData = {
      id: 'progress-1',
      userId,
      algorithmId,
      status: 'IN_PROGRESS',
      timeSpent: 45,
      attempts: 3,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      algorithm: {
        id: algorithmId,
        title: 'Two Sum',
        difficulty: 'EASY',
      },
      bestSubmission: {
        id: 'submission-1',
        language: 'javascript',
        executionTime: 120,
        memoryUsed: 15,
        createdAt: new Date().toISOString(),
      },
    };

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting algorithm progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get recommended algorithms
 */
export const getRecommendedAlgorithms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Mock data for now
    const mockData = [
      {
        id: 'alg-3',
        title: 'Valid Palindrome',
        description: 'Check if a string is a valid palindrome',
        difficulty: 'EASY',
        category: {
          id: 'cat-2',
          name: 'Strings',
          slug: 'strings',
        },
        tags: ['string', 'two-pointers'],
        viewCount: 890,
        averageRating: 4.1,
        _count: {
          progress: 650,
        },
      },
      {
        id: 'alg-4',
        title: 'Merge Two Sorted Lists',
        description: 'Merge two sorted linked lists',
        difficulty: 'EASY',
        category: {
          id: 'cat-3',
          name: 'Linked Lists',
          slug: 'linked-lists',
        },
        tags: ['linked-list', 'recursion'],
        viewCount: 750,
        averageRating: 4.3,
        _count: {
          progress: 520,
        },
      },
    ];

    res.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Error getting recommended algorithms:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Rate algorithm
 */
export const rateAlgorithm = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { algorithmId } = req.params;
    const userId = req.user!.id;
    const { rating, review } = req.body;

    // Mock response
    res.json({
      success: true,
      message: 'Algorithm rated successfully',
      data: {
        algorithmId,
        userId,
        rating,
        review,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error rating algorithm:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};