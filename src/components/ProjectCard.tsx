import { useState } from "react";
import ImageModal from "./ImageModal";

export default function ProjectCard({
  title,
  images,
  size,
  category,
}: {
  title: string;
  images: string[];
  size: string;
  category: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="project-item card bg-[#111] p-4 border border-[#1a1a1a] hover:border-[#E9B25B] transition-all duration-500 cursor-pointer rounded-lg"
        data-category={category.toLowerCase()}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative w-full h-80 rounded-lg overflow-hidden mb-6 cursor-pointer">
          <div className="absolute inset-0 bg-[#222] animate-pulse z-0"></div>

          <div
            className="absolute inset-0 z-10 bg-cover bg-center"
            style={{ backgroundImage: `url('${images[0] || ""}')` }}
          ></div>
        </div>
        <div className="p-2">
          <h3 className="text-2xl font-semibold text-white mb-2 font-['Montserrat']">
            {title}
          </h3>
          {size && (
            <p className="text-[#E9B25B] font-bold uppercase mb-4">{size}</p>
          )}
          <div className="h-px bg-[#222] my-4"></div>
          <span className="text-[#666] text-[0.7rem] uppercase tracking-[0.1rem]">
            {category}
          </span>
        </div>
      </div>

      <ImageModal
        isOpen={isOpen}
        initialIndex={0}
        images={images}
        onClose={() => setIsOpen(false)}
        title={title}
      />
    </>
  );
}
