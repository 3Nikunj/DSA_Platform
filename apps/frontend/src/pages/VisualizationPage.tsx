import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface VisualizationStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
}
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ForwardIcon,
  BackwardIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ClockIcon,
  SignalIcon,
  CubeIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { ThreeVisualization } from '../components/visualization/ThreeVisualization';

const algorithms = {
  1: {
    name: 'Bubble Sort',
    description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    category: 'sorting',
  },
  2: {
    name: 'Quick Sort',
    description: 'An efficient divide-and-conquer algorithm that works by selecting a pivot element and partitioning the array around it.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    category: 'sorting',
  },
  3: {
    name: 'Merge Sort',
    description: 'A stable divide-and-conquer algorithm that divides the array into halves, sorts them, and then merges them back together.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    category: 'sorting',
  },
};

const generateRandomArray = (size: number) => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 300) + 10);
};

const bubbleSortSteps = (arr: number[]) => {
  const steps = [];
  const array = [...arr];
  const n = array.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...array],
        comparing: [j, j + 1],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
      });
      
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        steps.push({
          array: [...array],
          comparing: [],
          swapping: [j, j + 1],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        });
      }
    }
  }
  
  steps.push({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, k) => k),
  });
  
  return steps;
};

const quickSortSteps = (arr: number[]) => {
  const steps = [];
  const array = [...arr];
  
  const quickSort = (low: number, high: number) => {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  };
  
  const partition = (low: number, high: number) => {
    const pivot = array[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      steps.push({
        array: [...array],
        comparing: [j, high],
        swapping: [],
        sorted: [],
      });
      
      if (array[j] < pivot) {
        i++;
        if (i !== j) {
          steps.push({
            array: [...array],
            comparing: [],
            swapping: [i, j],
            sorted: [],
          });
          
          [array[i], array[j]] = [array[j], array[i]];
          
          steps.push({
            array: [...array],
            comparing: [],
            swapping: [],
            sorted: [],
          });
        }
      }
    }
    
    steps.push({
      array: [...array],
      comparing: [],
      swapping: [i + 1, high],
      sorted: [],
    });
    
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    
    steps.push({
      array: [...array],
      comparing: [],
      swapping: [],
      sorted: [i + 1],
    });
    
    return i + 1;
  };
  
  quickSort(0, array.length - 1);
  
  steps.push({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: array.length }, (_, i) => i),
  });
  
  return steps;
};

const mergeSortSteps = (arr: number[]) => {
  const steps = [];
  const array = [...arr];
  
  const mergeSort = (left: number, right: number) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    }
  };
  
  const merge = (left: number, mid: number, right: number) => {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
      steps.push({
        array: [...array],
        comparing: [left + i, mid + 1 + j],
        swapping: [],
        sorted: [],
      });
      
      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        i++;
      } else {
        array[k] = rightArr[j];
        j++;
      }
      
      steps.push({
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: [],
      });
      
      k++;
    }
    
    while (i < leftArr.length) {
      array[k] = leftArr[i];
      steps.push({
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: [],
      });
      i++;
      k++;
    }
    
    while (j < rightArr.length) {
      array[k] = rightArr[j];
      steps.push({
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: [],
      });
      j++;
      k++;
    }
  };
  
  mergeSort(0, array.length - 1);
  
  steps.push({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: array.length }, (_, i) => i),
  });
  
  return steps;
};

export const VisualizationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : null;
  const algorithm = numericId && numericId in algorithms ? algorithms[numericId as keyof typeof algorithms] : undefined;
  
  const [array, setArray] = useState<number[]>(generateRandomArray(20));
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [arraySize, setArraySize] = useState(20);
  const [is3DMode, setIs3DMode] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentVisualization = steps[currentStep] || {
    array,
    comparing: [],
    swapping: [],
    sorted: [],
  };

  useEffect(() => {
    let sortSteps: VisualizationStep[] = [];
    if (algorithm?.name === 'Bubble Sort') {
      sortSteps = bubbleSortSteps(array);
    } else if (algorithm?.name === 'Quick Sort') {
      sortSteps = quickSortSteps(array);
    } else if (algorithm?.name === 'Merge Sort') {
      sortSteps = mergeSortSteps(array);
    }
    setSteps(sortSteps);
    setCurrentStep(0);
  }, [array, algorithm]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleNewArray = () => {
    setIsPlaying(false);
    setArray(generateRandomArray(arraySize));
    setCurrentStep(0);
  };

  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getBarColor = (index: number) => {
    if (currentVisualization.sorted.includes(index)) {
      return 'bg-green-500';
    }
    if (currentVisualization.swapping.includes(index)) {
      return 'bg-red-500';
    }
    if (currentVisualization.comparing.includes(index)) {
      return 'bg-yellow-500';
    }
    return 'bg-primary-500';
  };

  if (!algorithm) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Algorithm Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            The requested algorithm visualization could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {algorithm.name} Visualization
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {algorithm.description}
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Time: </span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {algorithm.timeComplexity}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <SignalIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Space: </span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {algorithm.spaceComplexity}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-primary-600" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Visualization Canvas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="card p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Array Visualization
                </h2>
                
                {/* 2D/3D Toggle */}
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setIs3DMode(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      !is3DMode
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <RectangleStackIcon className="w-4 h-4" />
                    <span>2D</span>
                  </button>
                  <button
                    onClick={() => setIs3DMode(true)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      is3DMode
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <CubeIcon className="w-4 h-4" />
                    <span>3D</span>
                  </button>
                </div>
              </div>
              
              {/* Visualization Content */}
              {is3DMode ? (
                <ThreeVisualization 
                  step={currentVisualization} 
                  isAnimating={isPlaying}
                />
              ) : (
                /* 2D Array Bars */
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 min-h-[400px] flex items-end justify-center space-x-1">
                  {currentVisualization.array.map((value: number, index: number) => (
                    <div
                      key={index}
                      className={`transition-all duration-300 rounded-t flex items-end justify-center text-xs text-white font-medium ${
                        getBarColor(index)
                      }`}
                      style={{
                        height: `${(value / Math.max(...currentVisualization.array)) * 300}px`,
                        width: `${Math.max(20, 400 / currentVisualization.array.length)}px`,
                      }}
                    >
                      <span className="mb-1">{value}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-300">Unsorted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-300">Comparing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-300">Swapping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-300">Sorted</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleStepBackward}
                disabled={currentStep === 0}
                className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BackwardIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={handlePlay}
                className="btn btn-primary p-3"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>
              
              <button
                onClick={handleStepForward}
                disabled={currentStep >= steps.length - 1}
                className="btn btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ForwardIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleReset}
                className="btn btn-secondary p-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Settings */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Cog6ToothIcon className="w-5 h-5" />
              <span>Settings</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Array Size: {arraySize}
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={arraySize}
                  onChange={(e) => setArraySize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Speed: {1100 - speed}ms
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  value={1100 - speed}
                  onChange={(e) => setSpeed(1100 - Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <button
                onClick={handleNewArray}
                className="w-full btn btn-secondary"
              >
                Generate New Array
              </button>
            </div>
          </div>

          {/* Algorithm Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Algorithm Details
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                  {algorithm.category}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Best Case:</span>
                <span className="ml-2 font-mono text-gray-600 dark:text-gray-400">
                  O(n)
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Average Case:</span>
                <span className="ml-2 font-mono text-gray-600 dark:text-gray-400">
                  {algorithm.timeComplexity}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Worst Case:</span>
                <span className="ml-2 font-mono text-gray-600 dark:text-gray-400">
                  {algorithm.timeComplexity}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Space:</span>
                <span className="ml-2 font-mono text-gray-600 dark:text-gray-400">
                  {algorithm.spaceComplexity}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Stable:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Yes
                </span>
              </div>
            </div>
          </div>

          {/* Current Step Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Step
            </h3>
            
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {currentVisualization.comparing.length > 0 && (
                <p className="mb-2">
                  Comparing elements at positions {currentVisualization.comparing.join(' and ')}
                </p>
              )}
              {currentVisualization.swapping.length > 0 && (
                <p className="mb-2 text-red-600 dark:text-red-400">
                  Swapping elements at positions {currentVisualization.swapping.join(' and ')}
                </p>
              )}
              {currentVisualization.sorted.length === currentVisualization.array.length && (
                <p className="text-green-600 dark:text-green-400">
                  Array is fully sorted!
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};