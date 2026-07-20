import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageModal({
  isOpen,
  images,
  initialIndex,
  onClose,
  title,
}: {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  if (!isOpen) return null;

  const next = (e: any) => {
    e.stopPropagation();
    setCurrentIndex((prev: number) => (prev + 1) % images.length);
  };

  const prev = (e: any) => {
    e.stopPropagation();
    setCurrentIndex(
      (prev: number) => (prev - 1 + images.length) % images.length,
    );
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      {/* Botón Cerrar (X) */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-white hover:text-[#E9B25B] transition-colors"
      >
        <X size={40} />
      </button>

      {/* Navegación Izquierda */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 text-white hover:text-[#E9B25B] transition-colors"
      >
        <ChevronLeft size={48} />
      </button>

      {/* Contenedor de Imagen y Título */}
      <div
        className="flex flex-col items-center max-w-[85vw] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          className="max-w-full max-h-[75vh] object-contain"
          alt={title}
        />
        {/* Título de la imagen */}
        <h3 className="text-white text-xl md:text-2xl font-semibold mt-6 tracking-wide text-center">
          {title}
        </h3>
      </div>

      {/* Navegación Derecha */}
      <button
        onClick={next}
        className="absolute right-4 md:right-8 text-white hover:text-[#E9B25B] transition-colors"
      >
        <ChevronRight size={48} />
      </button>

      {/* Indicador de posición */}
      <div className="absolute bottom-6 text-white/50 text-sm font-['Inter'] tracking-widest">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
