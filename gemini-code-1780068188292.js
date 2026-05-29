import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TextExplainer from '../components/TextExplainer';

export default function CourseMaterials() {
  const [data, setData] = useState({ materials: [], notices: [] });
  const [selectedLevel, setSelectedLevel] = useState('100');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    };
    fetchData().catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Materials Core Board */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800">Lecturer Uploaded Vault</h2>
          <div className="flex gap-2">
            {['100', '200', '300', '400', 'Postgraduate'].map(lvl => (
              <button 
                key={lvl} 
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedLevel === lvl ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {lvl} Lvl
              </button>
            ))}
          </div>
        </div>

        <TextExplainer>
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <p className="text-xs text-indigo-600 font-bold tracking-wider uppercase mb-2">💡 Tip: Highlight any technical word below for an instant AI breakdown.</p>
            {data.materials.filter(m => m.level === selectedLevel).map(mat => (
              <div key={mat.id} className="p-4 border border-gray-100 rounded-lg hover:bg-slate-50 transition flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900">{mat.course_code}: {mat.title}</h4>
                  <p className="text-xs text-gray-500">Verified Department Asset • Uploaded by {mat.lecturer}</p>
                </div>
                <a href={`/${mat.file_path}`} download className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Download</a>
              </div>
            ))}
          </div>
        </TextExplainer>
      </div>

      {/* Tutor Board Context Notice Panel */}
      <div className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-md space-y-4 h-fit">
        <h3 className="text-lg font-bold border-b border-indigo-700 pb-2">Tutor Notice Board</h3>
        {data.notices.length === 0 ? <p className="text-sm text-indigo-200">No new updates broadcast.</p> : 
          data.notices.map(notice => (
            <div key={notice.id} className="space-y-1">
              <h5 className="font-semibold text-sm text-indigo-300">{notice.title}</h5>
              <p className="text-xs text-gray-300 leading-relaxed">{notice.content}</p>
              <span className="text-[10px] text-indigo-400 block">{new Date(notice.created_at).toLocaleDateString()}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}