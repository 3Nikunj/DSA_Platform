import { PrismaClient, Difficulty, ProgressStatus, SubmissionStatus, AchievementType, Rarity } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'sorting' },
      update: {},
      create: {
        name: 'Sorting Algorithms',
        slug: 'sorting',
        description: 'Learn various sorting algorithms and their implementations',
        color: '#FF6B6B',
        icon: 'sort',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'searching' },
      update: {},
      create: {
        name: 'Searching Algorithms',
        slug: 'searching',
        description: 'Master different searching techniques and algorithms',
        color: '#4ECDC4',
        icon: 'search',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'graph' },
      update: {},
      create: {
        name: 'Graph Algorithms',
        slug: 'graph',
        description: 'Explore graph traversal and shortest path algorithms',
        color: '#45B7D1',
        icon: 'network',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'dynamic-programming' },
      update: {},
      create: {
        name: 'Dynamic Programming',
        slug: 'dynamic-programming',
        description: 'Learn optimization techniques and memoization',
        color: '#96CEB4',
        icon: 'layers',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'data-structures' },
      update: {},
      create: {
        name: 'Data Structures',
        slug: 'data-structures',
        description: 'Understand fundamental data structures',
        color: '#FFEAA7',
        icon: 'database',
      },
    }),
  ]);

  // Create algorithms
  console.log('🧮 Creating algorithms...');
  const algorithms = await Promise.all([
    // Sorting Algorithms
    prisma.algorithm.upsert({
      where: { slug: 'bubble-sort' },
      update: {},
      create: {
        title: 'Bubble Sort',
        slug: 'bubble-sort',
        description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        difficulty: Difficulty.EASY,
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        categoryId: categories[0].id,
        content: {
          explanation: 'Bubble sort is a simple sorting algorithm that works by repeatedly swapping adjacent elements if they are in wrong order.',
          pseudocode: `for i = 0 to n-1:\n  for j = 0 to n-i-2:\n    if arr[j] > arr[j+1]:\n      swap arr[j] and arr[j+1]`,
          examples: [
            {
              input: '[64, 34, 25, 12, 22, 11, 90]',
              output: '[11, 12, 22, 25, 34, 64, 90]',
              explanation: 'Each pass bubbles the largest element to the end'
            }
          ],
          hints: [
            'Compare adjacent elements',
            'Swap if they are in wrong order',
            'Repeat until no swaps are needed'
          ]
        },
        tags: ['sorting', 'comparison', 'stable'],
        isPublished: true,
      },
    }),
    prisma.algorithm.upsert({
      where: { slug: 'selection-sort' },
      update: {},
      create: {
        title: 'Selection Sort',
        slug: 'selection-sort',
        description: 'An in-place comparison sorting algorithm that divides the input list into sorted and unsorted regions.',
        difficulty: Difficulty.EASY,
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        categoryId: categories[0].id,
        content: {
          explanation: 'Selection sort finds the minimum element and places it at the beginning, then repeats for the remaining elements.',
          pseudocode: `for i = 0 to n-1:\n  min_idx = i\n  for j = i+1 to n:\n    if arr[j] < arr[min_idx]:\n      min_idx = j\n  swap arr[i] and arr[min_idx]`,
          examples: [
            {
              input: '[64, 25, 12, 22, 11]',
              output: '[11, 12, 22, 25, 64]',
              explanation: 'Selects minimum element in each iteration'
            }
          ],
          hints: [
            'Find the minimum element in unsorted portion',
            'Swap it with the first unsorted element',
            'Move the boundary of sorted portion'
          ]
        },
        tags: ['sorting', 'comparison', 'unstable'],
        isPublished: true,
      },
    }),
    prisma.algorithm.upsert({
      where: { slug: 'merge-sort' },
      update: {},
      create: {
        title: 'Merge Sort',
        slug: 'merge-sort',
        description: 'An efficient, stable, divide-and-conquer sorting algorithm that divides the array into halves, sorts them, and merges them back.',
        difficulty: Difficulty.MEDIUM,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        categoryId: categories[0].id,
        content: {
          explanation: 'Merge sort uses divide-and-conquer approach to sort arrays efficiently.',
          pseudocode: `function mergeSort(arr):\n  if length(arr) <= 1:\n    return arr\n  mid = length(arr) / 2\n  left = mergeSort(arr[0:mid])\n  right = mergeSort(arr[mid:])\n  return merge(left, right)`,
          examples: [
            {
              input: '[38, 27, 43, 3, 9, 82, 10]',
              output: '[3, 9, 10, 27, 38, 43, 82]',
              explanation: 'Recursively divides and merges sorted subarrays'
            }
          ],
          hints: [
            'Divide the array into two halves',
            'Recursively sort both halves',
            'Merge the sorted halves'
          ]
        },
        tags: ['sorting', 'divide-conquer', 'stable'],
        isPublished: true,
      },
    }),
    // Searching Algorithms
    prisma.algorithm.upsert({
      where: { slug: 'binary-search' },
      update: {},
      create: {
        title: 'Binary Search',
        slug: 'binary-search',
        description: 'An efficient algorithm for finding an item from a sorted list of items by repeatedly dividing the search interval in half.',
        difficulty: Difficulty.EASY,
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        categoryId: categories[1].id,
        content: {
          explanation: 'Binary search works on sorted arrays by comparing the target with the middle element.',
          pseudocode: `function binarySearch(arr, target):\n  left = 0, right = length(arr) - 1\n  while left <= right:\n    mid = (left + right) / 2\n    if arr[mid] == target:\n      return mid\n    elif arr[mid] < target:\n      left = mid + 1\n    else:\n      right = mid - 1\n  return -1`,
          examples: [
            {
              input: 'arr = [2, 3, 4, 10, 40], target = 10',
              output: 'index = 3',
              explanation: 'Found target at index 3'
            }
          ],
          hints: [
            'Array must be sorted',
            'Compare with middle element',
            'Eliminate half of the search space'
          ]
        },
        tags: ['searching', 'divide-conquer', 'logarithmic'],
        isPublished: true,
      },
    }),
  ]);

  // Create test users
  console.log('👥 Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@dsaplatform.com' },
      update: {},
      create: {
        email: 'admin@dsaplatform.com',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        isVerified: true,
        isPremium: true,
        level: 10,
        experience: 5000,
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        username: 'john_doe',
        firstName: 'John',
        lastName: 'Doe',
        password: hashedPassword,
        isVerified: true,
        level: 3,
        experience: 750,
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        email: 'jane@example.com',
        username: 'jane_smith',
        firstName: 'Jane',
        lastName: 'Smith',
        password: hashedPassword,
        isVerified: true,
        isPremium: true,
        level: 5,
        experience: 1500,
      },
    }),
  ]);

  // Create achievements
  console.log('🏆 Creating achievements...');
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { slug: 'first-algorithm' },
      update: {},
      create: {
        title: 'First Steps',
        slug: 'first-algorithm',
        description: 'Complete your first algorithm',
        icon: '🎯',
        type: AchievementType.MILESTONE,
        rarity: Rarity.COMMON,
        points: 10,
        criteria: {
          type: 'algorithm_completed',
          count: 1
        },
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'sorting-master' },
      update: {},
      create: {
        title: 'Sorting Master',
        slug: 'sorting-master',
        description: 'Complete all sorting algorithms',
        icon: '🔄',
        type: AchievementType.CATEGORY,
        rarity: Rarity.RARE,
        points: 100,
        criteria: {
          type: 'category_completed',
          category: 'sorting'
        },
      },
    }),
    prisma.achievement.upsert({
      where: { slug: 'speed-demon' },
      update: {},
      create: {
        title: 'Speed Demon',
        slug: 'speed-demon',
        description: 'Complete an algorithm in under 5 minutes',
        icon: '⚡',
        type: AchievementType.PERFORMANCE,
        rarity: Rarity.EPIC,
        points: 50,
        criteria: {
          type: 'completion_time',
          maxTime: 300 // 5 minutes in seconds
        },
      },
    }),
  ]);

  // Create some progress records
  console.log('📊 Creating progress records...');
  await Promise.all([
    prisma.progress.create({
      data: {
        userId: users[1].id, // John
        algorithmId: algorithms[0].id, // Bubble Sort
        status: ProgressStatus.COMPLETED,
        timeSpent: 1800, // 30 minutes
        completedAt: new Date(),
      },
    }),
    prisma.progress.create({
      data: {
        userId: users[1].id, // John
        algorithmId: algorithms[1].id, // Selection Sort
        status: ProgressStatus.IN_PROGRESS,
        timeSpent: 900, // 15 minutes
      },
    }),
    prisma.progress.create({
      data: {
        userId: users[2].id, // Jane
        algorithmId: algorithms[0].id, // Bubble Sort
        status: ProgressStatus.COMPLETED,
        timeSpent: 1200, // 20 minutes
        completedAt: new Date(),
      },
    }),
    prisma.progress.create({
      data: {
        userId: users[2].id, // Jane
        algorithmId: algorithms[2].id, // Merge Sort
        status: ProgressStatus.COMPLETED,
        timeSpent: 2400, // 40 minutes
        completedAt: new Date(),
      },
    }),
  ]);

  // Create some submissions
  console.log('💻 Creating submissions...');
  await Promise.all([
    prisma.submission.create({
      data: {
        userId: users[1].id,
        algorithmId: algorithms[0].id,
        code: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr`,
        language: 'python',
        status: SubmissionStatus.ACCEPTED,
        executionTime: 150,
        memoryUsed: 1024,
        testCasesPassed: 10,
        totalTestCases: 10,
      },
    }),
    prisma.submission.create({
      data: {
        userId: users[2].id,
        algorithmId: algorithms[2].id,
        code: `def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    \n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    \n    return merge(left, right)`,
        language: 'python',
        status: SubmissionStatus.ACCEPTED,
        executionTime: 89,
        memoryUsed: 2048,
        testCasesPassed: 15,
        totalTestCases: 15,
      },
    }),
  ]);

  // Award achievements
  console.log('🎖️ Awarding achievements...');
  await Promise.all([
    prisma.userAchievement.create({
      data: {
        userId: users[1].id,
        achievementId: achievements[0].id, // First Steps
        earnedAt: new Date(),
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[2].id,
        achievementId: achievements[0].id, // First Steps
        earnedAt: new Date(),
      },
    }),
  ]);

  // Create sample challenges
  console.log('🎯 Creating challenges...');
  await Promise.all([
    prisma.challenge.create({
      data: {
        title: 'Two Sum',
        slug: 'two-sum',
        description: 'Given an array of integers and a target sum, return indices of two numbers that add up to the target.',
        difficulty: Difficulty.EASY,
        points: 10,
        timeLimit: 3600, // 1 hour
        memoryLimit: 128, // 128 MB
        content: {
          problem: 'Find two numbers in array that sum to target',
          examples: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              output: '[0,1]',
              explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
            }
          ],
          constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            'Only one valid answer exists'
          ]
        },
        tags: ['array', 'hash-table'],
        isPublished: true,
        isFeatured: true,
      },
    }),
    prisma.challenge.create({
      data: {
        title: 'Reverse Linked List',
        slug: 'reverse-linked-list',
        description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
        difficulty: Difficulty.EASY,
        points: 15,
        timeLimit: 3600,
        memoryLimit: 128,
        content: {
          problem: 'Reverse a singly linked list',
          examples: [
            {
              input: 'head = [1,2,3,4,5]',
              output: '[5,4,3,2,1]',
              explanation: 'Reverse the linked list'
            }
          ],
          constraints: [
            'Number of nodes is in range [0, 5000]',
            '-5000 <= Node.val <= 5000'
          ]
        },
        tags: ['linked-list', 'recursion'],
        isPublished: true,
      },
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${algorithms.length} algorithms`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${achievements.length} achievements`);
  console.log(`   - 2 challenges`);
  console.log(`   - Sample progress and submissions`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });