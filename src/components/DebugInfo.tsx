
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const DebugInfo: React.FC = () => {
  const isMobile = useIsMobile();
  const [windowInfo, setWindowInfo] = useState({
    width: 0,
    height: 0,
    userAgent: ''
  });

  useEffect(() => {
    // Só acessa window no cliente
    if (typeof window !== 'undefined') {
      const updateWindowInfo = () => {
        setWindowInfo({
          width: window.innerWidth,
          height: window.innerHeight,
          userAgent: navigator.userAgent
        });
      };

      updateWindowInfo();
      window.addEventListener('resize', updateWindowInfo);

      return () => {
        window.removeEventListener('resize', updateWindowInfo);
      };
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 bg-red-500 text-white p-2 text-xs z-50">
      <div>Mobile: {isMobile ? 'Sim' : 'Não'}</div>
      <div>Width: {windowInfo.width}px</div>
      <div>Height: {windowInfo.height}px</div>
      <div>UA: {windowInfo.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
    </div>
  );
};

export default DebugInfo;
