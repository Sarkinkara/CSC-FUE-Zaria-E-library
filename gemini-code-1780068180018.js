import React, { useState } from 'react';

export default function Compiler() {
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState('// Type code here...\nconsole.log("Hello World");');
  const [output, setOutput] = useState('');

  const runCode = () => {
    setOutput('Compiling and executing environment in safe runtime container...\n');
    setTimeout(() => {
      if (lang === 'javascript') {
        setOutput((prev) => prev + 'Success! Standard Output:\nHello World');
      } else {
        setOutput((prev) => prev + `Mock Execution complete for framework: ${lang}`);
      }
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-indigo-900">Departmental Multi-Language Sandbox</h2>
      <div className="flex gap-4 mb-4">
        <select 
          value={lang} 
          onChange={(e) => setLang(e.target.value)}
          className="p-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="javascript">JavaScript (Node.js)</option>
          <option value="python">Python 3</option>
          <option value="cpp">C++ (GCC 11)</option>
          <option value="java">Java (OpenJDK 17)</option>
        </select>
        <button onClick={runCode} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded shadow transition">
          Run Code
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono text-sm p-4 h-64 bg-gray-900 text-green-400 rounded-lg focus:outline-none border border-gray-800"
        />
        <div className="font-mono text-sm p-4 h-64 bg-slate-950 text-gray-300 rounded-lg overflow-y-auto border border-gray-800">
          <span className="text-gray-500 block mb-1">// System Terminal Output</span>
          {output}
        </div>
      </div>
    </div>
  );
}