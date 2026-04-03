import React, { useRef, useState, useEffect } from "react";
import { Eraser, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

interface SignaturePadProps {
  initialSignature?: string | null;
  onSave: (dataUrl: string | null) => void;
  className?: string;
}

export default function SignaturePad({ initialSignature, onSave, className }: SignaturePadProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (initialSignature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHasSignature(true);
        };
        img.src = initialSignature;
      }
    }
  }, [initialSignature]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (("touches" in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left) * (canvas.width / rect.width);
    const y = (("touches" in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (("touches" in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left) * (canvas.width / rect.width);
    const y = (("touches" in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current && hasSignature) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHasSignature(false);
        onSave(null);
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative bg-zinc-50 border-2 border-zinc-100 rounded-2xl overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="w-full h-auto block"
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-zinc-300 font-medium text-sm">
            {t("Draw your signature here")}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <CheckCircle2 size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t("Hand-drawn Signature")}</span>
        </div>
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <Eraser size={14} /> {t("Clear Pad")}
        </button>
      </div>
    </div>
  );
}
