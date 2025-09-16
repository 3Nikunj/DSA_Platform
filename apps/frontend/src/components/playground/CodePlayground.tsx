import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PlayIcon, StopIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface CodePlaygroundProps {
  initialCode?: string;
  language?: string;
  theme?: 'vs-dark' | 'light';
  onCodeChange?: (code: string) => void;
}

const CodePlayground: React.FC<CodePlaygroundProps> = ({
  initialCode = '// Welcome to the Code Playground!\n// Write your code here and click Run to execute\n\nconsole.log("Hello, World!");',
  language = 'javascript',
  theme = 'vs-dark',
  onCodeChange
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', extension: '.js' },
    { value: 'typescript', label: 'TypeScript', extension: '.ts' },
    { value: 'python', label: 'Python', extension: '.py' },
    { value: 'java', label: 'Java', extension: '.java' },
    { value: 'cpp', label: 'C++', extension: '.cpp' },
    { value: 'html', label: 'HTML', extension: '.html' },
    { value: 'css', label: 'CSS', extension: '.css' },
  ];

  const handleEditorDidMount = (editor: import('monaco-editor').editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');

    try {
      // Simulate code execution for different languages
      if (selectedLanguage === 'javascript' || selectedLanguage === 'typescript') {
        // For JavaScript/TypeScript, we can actually execute simple code
        const originalLog = console.log;
        const logs: string[] = [];
        
        console.log = (...args) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        };

        try {
          // Create a function to execute the code safely
          const func = new Function(code);
          func();
          setOutput(logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)');
        } catch (error) {
          setOutput(`Error: ${(error as Error).message}`);
        } finally {
          console.log = originalLog;
        }
      } else {
        // For other languages, show a simulated output
        setOutput(`Code execution simulated for ${selectedLanguage}\n\nNote: This is a frontend-only playground. \nFor full execution support, a backend service would be needed.\n\nYour code:\n${code}`);
      }
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
    editorRef.current?.setValue('');
  };

  const downloadCode = () => {
    const selectedLang = languages.find(lang => lang.value === selectedLanguage);
    const extension = selectedLang?.extension || '.txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadCode = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        editorRef.current?.setValue(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold">Code Playground</h2>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={uploadCode}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            <span>Upload</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCode}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Download</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearCode}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Clear</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center space-x-1 px-4 py-2 rounded transition-colors ${
              isRunning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRunning ? (
              <>
                <StopIcon className="w-4 h-4" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Run</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 border-r border-gray-700">
          <Editor
            height="100%"
            language={selectedLanguage}
            theme={theme}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              glyphMargin: false,
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="w-1/3 bg-gray-800 flex flex-col">
          <div className="p-3 bg-gray-700 border-b border-gray-600">
            <h3 className="font-semibold">Output</h3>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {output || 'Click "Run" to execute your code and see the output here.'}
            </pre>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.ts,.py,.java,.cpp,.html,.css,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default CodePlayground;