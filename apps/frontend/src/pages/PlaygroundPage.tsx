import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface Language {
  id: string;
  name: string;
  extension: string;
}

interface TestResult {
  id: number;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  time: string;
}

interface MonacoEditor {
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
}

interface ChallengeExample {
  input: string;
  output: string;
  explanation: string;
}

interface Challenge {
  title: string;
  difficulty: string;
  description: string;
  examples: ChallengeExample[];
  constraints: string[];
  starterCode: Record<string, string>;
}
import {
  PlayIcon,
  Cog6ToothIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CodeBracketIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import Editor from '@monaco-editor/react';
import CodePlayground from '../components/playground/CodePlayground';

const languages = [
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
];

const challenges = {
  1: {
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Your code here
    
}`,
      python: `def two_sum(nums, target):
    # Your code here
    pass`,
      java: `public int[] twoSum(int[] nums, int target) {
    // Your code here
    
}`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your code here
    
}`,
    },
  },
  2: {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'The string contains valid parentheses.',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All brackets are properly closed.',
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Mismatched brackets.',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    starterCode: {
      javascript: `function isValid(s) {
    // Your code here
    
}`,
      python: `def is_valid(s):
    # Your code here
    pass`,
      java: `public boolean isValid(String s) {
    // Your code here
    
}`,
      cpp: `bool isValid(string s) {
    // Your code here
    
}`,
      typescript: `function isValid(s: string): boolean {
    // Your code here
    
}`,
    },
  },
};

const testResults = [
  { id: 1, input: '[2,7,11,15], 9', expected: '[0,1]', actual: '[0,1]', passed: true, time: '2ms' },
  { id: 2, input: '[3,2,4], 6', expected: '[1,2]', actual: '[1,2]', passed: true, time: '1ms' },
  { id: 3, input: '[3,3], 6', expected: '[0,1]', actual: '[0,1]', passed: true, time: '1ms' },
];

export const PlaygroundPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challenge');
  const numericChallengeId = challengeId ? parseInt(challengeId, 10) : null;
  const challenge = numericChallengeId && numericChallengeId in challenges ? challenges[numericChallengeId as keyof typeof challenges] : null;
  
  const [activeTab, setActiveTab] = useState<'challenges' | 'playground'>(
    challengeId ? 'challenges' : 'playground'
  );
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(
    challenge?.starterCode[selectedLanguage as keyof typeof challenge.starterCode] || 
    '// Welcome to the DSA Playground!\n// Write your code here and test it.\n\nfunction example() {\n    console.log("Hello, World!");\n}'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [showTests, setShowTests] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('vs-dark');
  const editorRef = useRef<MonacoEditor | null>(null);

  const handleEditorDidMount = (editor: MonacoEditor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (languageId: string) => {
    setSelectedLanguage(languageId);
    if (challenge) {
      setCode(challenge.starterCode[languageId as keyof typeof challenge.starterCode] || '');
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    // Simulate code execution
    setTimeout(() => {
      setOutput('Code executed successfully!\nOutput: [0, 1]');
      setIsRunning(false);
      if (challenge) {
        setShowTests(true);
      }
    }, 2000);
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput('Running tests...');
    
    // Simulate test execution
    setTimeout(() => {
      setOutput('All tests passed! ✅\nExecution time: 4ms\nMemory usage: 42.1 MB');
      setIsRunning(false);
      setShowTests(true);
    }, 3000);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Code Playground
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Practice coding challenges or experiment with free-form code
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('challenges')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'challenges'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <AcademicCapIcon className="w-4 h-4" />
                <span>Challenges</span>
              </button>
              <button
                onClick={() => setActiveTab('playground')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'playground'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <CodeBracketIcon className="w-4 h-4" />
                <span>Free Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'playground' ? (
          <CodePlayground />
        ) : (
          <ChallengesInterface
            challenge={challenge}
            selectedLanguage={selectedLanguage}
            code={code}
            setCode={setCode}
            isRunning={isRunning}
            output={output}
            showTests={showTests}
            fontSize={fontSize}
            theme={theme}
            handleEditorDidMount={handleEditorDidMount}
            handleLanguageChange={handleLanguageChange}
            handleRunCode={handleRunCode}
            handleSubmit={handleSubmit}
            setFontSize={setFontSize}
            setTheme={setTheme}
            languages={languages}
            testResults={testResults}
          />
        )}
      </div>
    </div>
  );
};

// Challenges Interface Component
interface ChallengesInterfaceProps {
  challenge: Challenge | null;
  selectedLanguage: string;
  code: string;
  setCode: (code: string) => void;
  isRunning: boolean;
  output: string;
  showTests: boolean;
  fontSize: number;
  theme: string;
  handleEditorDidMount: (editor: MonacoEditor) => void;
  handleLanguageChange: (languageId: string) => void;
  handleRunCode: () => void;
  handleSubmit: () => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: string) => void;
  languages: Language[];
  testResults: TestResult[];
}

const ChallengesInterface: React.FC<ChallengesInterfaceProps> = ({
  challenge,
  selectedLanguage,
  code,
  setCode,
  isRunning,
  output,
  showTests,
  fontSize,
  theme,
  handleEditorDidMount,
  handleLanguageChange,
  handleRunCode,
  handleSubmit,
  setFontSize,
  setTheme,
  languages,
  testResults,
}) => {
  if (!challenge) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Challenge Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested challenge could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Problem Description Panel */}
      {challenge && (
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                challenge.difficulty === 'Easy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : challenge.difficulty === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {challenge.difficulty}
              </span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {challenge.title}
              </h2>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {challenge.description}
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Examples
              </h3>
              {challenge.examples.map((example: ChallengeExample, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">Input:</span>
                    <code className="ml-2 text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      {example.input}
                    </code>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">Output:</span>
                    <code className="ml-2 text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                      {example.output}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Explanation:</span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {example.explanation}
                    </span>
                  </div>
                </div>
              ))}
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Constraints
              </h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {challenge.constraints.map((constraint: string, index: number) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Code Editor and Output */}
      <div className={`${challenge ? 'w-1/2' : 'w-full'} flex flex-col`}>
        {/* Editor Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Settings */}
              <div className="flex items-center space-x-2">
                <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="hc-black">High Contrast</option>
                </select>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16"
                  title="Font Size"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="btn btn-secondary flex items-center space-x-2 disabled:opacity-50"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Run</span>
                </button>
                
                {challenge && (
                  <button
                    onClick={handleSubmit}
                    disabled={isRunning}
                    className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <Editor
            height="60%"
            language={selectedLanguage}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            theme={theme}
            options={{
              fontSize,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
          
          {/* Output Panel */}
          <div className="h-2/5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Output
                </span>
              </div>
              {isRunning && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-yellow-500 animate-spin" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    Running...
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4 h-full overflow-y-auto">
              {output ? (
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {output}
                </pre>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  Click "Run" to execute your code or "Submit" to test against all cases.
                </div>
              )}
            </div>
          </div>
          
          {/* Test Results */}
          {showTests && challenge && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Test Results
                </span>
              </div>
              <div className="p-4 max-h-40 overflow-y-auto">
                {testResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      {result.passed ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Test {result.id}: {result.input}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{result.time}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.passed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};