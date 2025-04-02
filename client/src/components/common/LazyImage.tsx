// client/src/components/common/LazyImage.tsx
import React, { useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string;
	alt: string;
	placeholderSrc?: string;
	fallbackSrc?: string;
	aspectRatio?: string; // e.g. "16/9", "1/1"
	blurEffect?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
	src,
	alt,
	placeholderSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23CCCCCC'/%3E%3C/svg%3E",
	fallbackSrc,
	aspectRatio = "4/3",
	blurEffect = true,
	className = "",
	onError,
	...props
}) => {
	const [imageRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
		threshold: 0.1,
		rootMargin: "100px",
	});

	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);

	const handleLoad = () => {
		setIsLoaded(true);
	};

	const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		setHasError(true);
		// Call the original onError handler if provided
		if (onError) {
			onError(e);
		}
	};

	return (
		<div ref={imageRef} className="relative overflow-hidden" style={{ aspectRatio }}>
			{/* Loading placeholder */}
			{!isLoaded && !hasError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

			{/* Main image - only load when visible */}
			{isVisible && (
				<img
					src={hasError && fallbackSrc ? fallbackSrc : src}
					alt={alt}
					onLoad={handleLoad}
					onError={handleError}
					className={`
            w-full h-full object-cover
            ${!isLoaded ? "opacity-0" : "opacity-100"}
            ${blurEffect && !isLoaded ? "blur-sm" : "blur-0"}
            transition-all duration-300
            ${className}
          `}
					loading="lazy"
					{...props}
				/>
			)}

			{/* Low-quality placeholder */}
			{!isLoaded && (
				<img
					src={placeholderSrc}
					alt={`Loading: ${alt}`}
					className={`
            absolute inset-0 w-full h-full object-cover
            ${isLoaded ? "opacity-0" : "opacity-100"}
            transition-opacity duration-300
          `}
					aria-hidden="true"
				/>
			)}
		</div>
	);
};

export default React.memo(LazyImage);
