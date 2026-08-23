import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from "lucide-react";
import ProjectCard from "./ProjectCard";

interface Project {
  title: string;
  images: string[];
  size: string;
  category: string;
  model?: string;
}

interface ProjectsGridProps {
  projects: Project[];
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    title: string;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: "",
  });

  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLoadTimeout = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  const startLoadTimeout = () => {
    clearLoadTimeout();
    // Fallback: if image doesn't load/error in 10s, show error
    loadTimeoutRef.current = setTimeout(() => {
      if (imageLoading && !imageError) {
        setImageLoading(false);
        setImageError(true);
      }
    }, 10000);
  };

  const openModal = (images: string[], title: string, initialIndex = 0) => {
    setModalState({
      isOpen: true,
      images,
      currentIndex: initialIndex,
      title,
    });
    setImageLoading(true);
    setImageError(false);
    touchStartX.current = null;
    touchEndX.current = null;
    startLoadTimeout();
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setImageLoading(false);
    setImageError(false);
    clearLoadTimeout();
  };

  const handleImageLoad = () => {
    clearLoadTimeout();
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    clearLoadTimeout();
    setImageLoading(false);
    setImageError(true);
  };

  const nextImage = () => {
    setModalState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
    setImageLoading(true);
    setImageError(false);
    startLoadTimeout();
  };

  const prevImage = () => {
    setModalState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
    setImageLoading(true);
    setImageError(false);
    startLoadTimeout();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modalState.isOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevImage();
          break;
        case 'Escape':
          e.preventDefault();
          closeModal();
          break;
      }
    };

    if (modalState.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalState.isOpen, modalState.images.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearLoadTimeout();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
        {projects.map((p, index) => (
          <ProjectCard
            key={`${p.category}-${p.title}-${index}`}
            title={p.title}
            images={p.images}
            size={p.size || ""}
            category={p.category}
            model={p.model}
            onOpenModal={openModal}
          />
        ))}
      </div>

      {modalState.isOpen && modalState.images.length > 0 && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${modalState.currentIndex + 1} of ${modalState.images.length}`}
          tabIndex={-1}
        >
          <button
            onClick={closeModal}
            className="absolute top-8 right-8 text-white hover:text-[#E9B25B] transition-colors"
            aria-label="Close modal"
          >
            <X size={40} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 md:left-8 text-white hover:text-[#E9B25B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous image"
            disabled={modalState.images.length <= 1 || imageLoading}
          >
            <ChevronLeft size={48} />
          </button>

          <div
            className="flex flex-col items-center max-w-[85vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#111] z-10">
                <Loader2 className="text-[#E9B25B] animate-spin" size={48} />
              </div>
            )}

            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#111] z-10 flex-col gap-4 text-white">
                <ImageIcon className="text-[#666]" size={64} />
                <p className="text-center px-4">No se pudo cargar la imagen</p>
                <button
                  onClick={() => {
                    setImageLoading(true);
                    setImageError(false);
                    startLoadTimeout();
                  }}
                  className="px-4 py-2 bg-[#E9B25B] text-[#0A0A0A] rounded font-medium hover:bg-[#E9B25B]/80 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}

            <img
              key={modalState.currentIndex}
              ref={imgRef}
              src={modalState.images[modalState.currentIndex]}
              className={`max-w-full max-h-[75vh] object-contain touch-pan-y ${imageLoading || imageError ? 'invisible' : 'visible'}`}
              alt={modalState.title}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <h3 className="text-white text-xl md:text-2xl font-semibold mt-6 tracking-wide text-center">
              {modalState.title}
            </h3>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 md:right-8 text-white hover:text-[#E9B25B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next image"
            disabled={modalState.images.length <= 1 || imageLoading}
          >
            <ChevronRight size={48} />
          </button>

          <div className="absolute bottom-6 text-white/50 text-sm font-['Inter'] tracking-widest">
            {modalState.currentIndex + 1} / {modalState.images.length}
          </div>
        </div>
      )}
    </>
  );
}