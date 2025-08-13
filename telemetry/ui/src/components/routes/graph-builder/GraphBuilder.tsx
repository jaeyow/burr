import React, { useEffect } from 'react';
import GraphBuilderComponent from './components/GraphBuilder';

export const GraphBuilder: React.FC = () => {
  // Fallback error suppression for any remaining ResizeObserver issues
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (
        e.message &&
        e.message.includes('ResizeObserver loop completed with undelivered notifications')
      ) {
        // Suppress ResizeObserver loop warnings
        // console.warn('ResizeObserver loop detected - this should be rare with debouncing in place');
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-900 text-white">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold">Burr Graph Builder</h1>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <GraphBuilderComponent />
      </div>
    </div>
  );
};
