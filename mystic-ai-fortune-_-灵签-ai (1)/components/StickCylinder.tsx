import React from 'react';

interface StickCylinderProps {
  isShaking: boolean;
  onStickDrawn?: () => void;
}

export const StickCylinder: React.FC<StickCylinderProps> = ({ isShaking }) => {
  return (
    <div className="relative w-64 h-80 mx-auto flex flex-col items-center justify-end">
        {/* Sticks protruding */}
        <div className={`absolute top-10 flex space-x-1 ${isShaking ? 'animate-pulse' : ''} transition-transform`}>
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-4 h-32 bg-yellow-200 border-l border-r border-yellow-700 rounded-t-sm transform origin-bottom"
                    style={{ 
                        transform: `rotate(${(i - 2) * 5}deg) translateY(${isShaking ? Math.random() * 10 : 0}px)`,
                        transition: 'transform 0.1s'
                    }} 
                />
            ))}
        </div>

        {/* Cylinder Body */}
        <div className={`relative z-10 w-40 h-56 bg-gradient-to-r from-red-900 via-red-700 to-red-900 rounded-lg shadow-2xl border-4 border-yellow-600 flex items-center justify-center ${isShaking ? 'animate-shake' : ''}`}>
             <div className="absolute top-4 bottom-4 left-4 right-4 border-2 border-yellow-600/30 rounded border-dashed opacity-50 pointer-events-none"></div>
             <div className="text-yellow-500 font-calligraphy text-5xl opacity-80 rotate-90 select-none">
                靈簽
             </div>
        </div>

        {/* Cylinder Base */}
        <div className="w-44 h-6 bg-yellow-900 rounded-full shadow-lg -mt-3 z-0"></div>
    </div>
  );
};
