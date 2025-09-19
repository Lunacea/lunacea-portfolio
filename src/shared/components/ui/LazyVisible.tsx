"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';

	type LazyVisibleProps = {
		children: ReactNode;
		rootMargin?: string;
		threshold?: number | number[];
		ssrPlaceholderHeight?: number; // reserve space to reduce CLS
		className?: string;
	};

export default function LazyVisible({ children, rootMargin = '200px 0px', threshold = 0, ssrPlaceholderHeight = 0, className }: LazyVisibleProps) {
		const ref = useRef<HTMLDivElement | null>(null);
		const [isVisible, setIsVisible] = useState(false);

		useEffect(() => {
			if (!ref.current || isVisible) return;
			if (!('IntersectionObserver' in window)) {
				setIsVisible(true);
				return;
			}
			const observer = new IntersectionObserver(
				(entries) => {
					const entry = entries[0];
					if (entry && entry.isIntersecting) {
						setIsVisible(true);
						observer.disconnect();
					}
				},
				{ root: null, rootMargin, threshold },
			);
			observer.observe(ref.current);
			return () => observer.disconnect();
		}, [isVisible, rootMargin, threshold]);

		const withPlaceholderClass = !isVisible && ssrPlaceholderHeight ? `${className ?? ''} lazy-visible-ph-${ssrPlaceholderHeight}`.trim() : className;
		return (
			<div ref={ref} className={withPlaceholderClass}>
				{isVisible ? children : null}
			</div>
		);
	}
