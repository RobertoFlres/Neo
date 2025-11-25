'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Importar ReactQuill dinámicamente para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded-lg p-4 h-32 animate-pulse bg-gray-200"></div>
});

// Importar estilos de Quill
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Escribe aquí...",
  height = "200px"
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'background': [] }, { 'color': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'background', 'color',
    'list', 'bullet', 'align', 'link'
  ];

  if (!mounted) {
    return (
      <div className="border border-gray-300 rounded-lg p-4" style={{ height }}>
        <div className="animate-pulse bg-gray-200 h-full rounded"></div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor w-full">
      {/* Editor ReactQuill */}
      <ReactQuill
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{ height: 'auto' }}
        className="border border-gray-300 rounded-lg"
      />
      
      <style jsx global>{`
        .rich-text-editor .ql-container {
          height: auto !important;
          overflow: visible !important;
        }
        .rich-text-editor .ql-editor {
          height: auto !important;
          overflow: visible !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          white-space: pre-wrap !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .rich-text-editor .ql-editor a {
          color: #2b3e81 !important;
          text-decoration: underline !important;
        }
        .rich-text-editor .ql-editor mark {
          background-color: #ffeb3b !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
        }
        .rich-text-editor .ql-toolbar .ql-background .ql-picker-item {
          width: 20px !important;
          height: 20px !important;
          border-radius: 3px !important;
          margin: 2px !important;
        }
        .rich-text-editor .ql-toolbar .ql-color .ql-picker-item {
          width: 20px !important;
          height: 20px !important;
          border-radius: 50% !important;
          margin: 2px !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;