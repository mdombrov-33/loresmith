import Image from "next/image";

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: "cover" | "contain";
  height?: string;
}

export default function CardImage({
  src,
  alt,
  className = "",
  objectFit = "cover",
  height = "h-48"
}: CardImageProps) {
  //* Only render if image exists and is a valid path
  if (!src || src === "None" || !src.startsWith("/")) {
    return null;
  }

  return (
    <div className={`relative ${height} w-full overflow-hidden ${className}`}>
      {/* Blurred background for contain mode */}
      {objectFit === "contain" && (
        <div className="absolute inset-0">
          <Image
            src={src}
            alt=""
            fill
            className="object-cover blur-xl opacity-30 scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            aria-hidden="true"
          />
        </div>
      )}
      {/* Main image */}
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className={objectFit === "contain" ? "object-contain drop-shadow-2xl" : "object-cover"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}
