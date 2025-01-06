import Image from "next/image";

export default function Gallery({ images }) {
  return (
    <div className="image-grid">
      {images.map((image) => (
        <div key={image.id} className="image-card">
          {image.thumbnailLink ? (
            <div className="image-container">
              <Image
                src={image.thumbnailLink.replace("=s220", "=s500")}
                alt={image.name}
                className="image"
                loading="lazy"
                fill={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="image-overlay">{image.name}</div>
            </div>
          ) : (
            <div className="image-placeholder">{image.name}</div>
          )}
        </div>
      ))}
    </div>
  );
}
