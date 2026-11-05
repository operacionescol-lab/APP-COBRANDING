import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({ value, size = 140, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch((err) => {
        console.error('Error rendering QR code:', err);
      });
    }
  }, [value, size]);

  return (
    <div className={`inline-flex p-2 bg-white rounded-lg shadow-inner border border-slate-200 ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};
