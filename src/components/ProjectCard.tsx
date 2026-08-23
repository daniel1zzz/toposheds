export default function ProjectCard({
  title,
  images,
  size,
  category,
  model,
  onOpenModal,
}: {
  title: string;
  images: string[];
  size: string;
  category: string;
  model?: string;
  onOpenModal: (images: string[], title: string, initialIndex?: number) => void;
}) {
  return (
    <div
      className="project-item card bg-[#111] p-4 border border-[#1a1a1a] hover:border-[#E9B25B] transition-all duration-500 cursor-pointer rounded-lg"
      data-category={category.toLowerCase()}
      data-model={model?.toLowerCase() || ""}
      onClick={() => onOpenModal(images, title, 0)}
    >
      <div className="relative w-full h-80 rounded-lg overflow-hidden mb-6 cursor-pointer">
        <div className="absolute inset-0 bg-[#222] animate-pulse z-0"></div>

        {images[0] && (
          <img
            src={images[0]}
            alt={title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 z-10 w-full h-full object-cover"
          />
        )}
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
  );
}