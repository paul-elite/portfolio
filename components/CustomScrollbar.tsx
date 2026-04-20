'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
  thumbHeight?: number;
  thumbWidth?: number;
  thumbColor?: string;
  thumbDragColor?: string;
  position?: 'left' | 'right';
  contentClassName?: string;
  contentRef?: React.RefObject<HTMLDivElement>;
}

export default function CustomScrollbar({
  children,
  className = '',
  thumbHeight = 40,
  thumbWidth = 2,
  thumbColor = 'hsl(210, 100%, 48%)',
  thumbDragColor = '#FF4D8C',
  position = 'right',
  contentClassName = '',
  contentRef: externalContentRef,
}: CustomScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalContentRef = useRef<HTMLDivElement>(null);
  const contentRef = externalContentRef || internalContentRef;
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [overscroll, setOverscroll] = useState(0); // -50 to 50 for elastic effect
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  // Update thumb position based on scroll
  const updateThumbPosition = () => {
    const content = contentRef.current;
    const container = containerRef.current;
    if (!content || !container) return;

    const scrollableHeight = content.scrollHeight - container.clientHeight;
    const trackHeight = container.clientHeight - thumbHeight;

    if (scrollableHeight <= 0) {
      setShowScrollbar(false);
      return;
    }

    setShowScrollbar(true);
    const scrollRatio = content.scrollTop / scrollableHeight;
    setThumbTop(scrollRatio * trackHeight);
  };

  // Handle scroll event and detect scrollable content
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => updateThumbPosition();
    content.addEventListener('scroll', handleScroll);

    // Initial check with slight delay to ensure content is rendered
    updateThumbPosition();
    requestAnimationFrame(() => updateThumbPosition());
    const initialTimer = setTimeout(() => updateThumbPosition(), 100);

    // Recheck on resize
    const resizeObserver = new ResizeObserver(() => updateThumbPosition());
    resizeObserver.observe(content);

    // Watch for content changes (children added/removed)
    const mutationObserver = new MutationObserver(() => updateThumbPosition());
    mutationObserver.observe(content, { childList: true, subtree: true });

    return () => {
      content.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearTimeout(initialTimer);
    };
  }, [thumbHeight]);

  // Handle thumb drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = contentRef.current?.scrollTop || 0;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const content = contentRef.current;
      const container = containerRef.current;
      if (!content || !container) return;

      const deltaY = e.clientY - dragStartY.current;
      const trackHeight = container.clientHeight - thumbHeight;
      const scrollableHeight = content.scrollHeight - container.clientHeight;

      const scrollDelta = (deltaY / trackHeight) * scrollableHeight;
      const newScrollTop = dragStartScrollTop.current + scrollDelta;

      // Calculate overscroll (elastic effect up to 50px)
      if (newScrollTop < 0) {
        setOverscroll(Math.max(-50, newScrollTop * 0.3));
        content.scrollTop = 0;
      } else if (newScrollTop > scrollableHeight) {
        setOverscroll(Math.min(50, (newScrollTop - scrollableHeight) * 0.3));
        content.scrollTop = scrollableHeight;
      } else {
        setOverscroll(0);
        content.scrollTop = newScrollTop;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setOverscroll(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, thumbHeight]);

  // Handle track click
  const handleTrackClick = (e: React.MouseEvent) => {
    const track = trackRef.current;
    const content = contentRef.current;
    const container = containerRef.current;
    if (!track || !content || !container) return;

    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top - thumbHeight / 2;
    const trackHeight = container.clientHeight - thumbHeight;
    const scrollableHeight = content.scrollHeight - container.clientHeight;

    const scrollRatio = Math.max(0, Math.min(1, clickY / trackHeight));
    content.scrollTop = scrollRatio * scrollableHeight;
  };

  // Calculate dynamic styles
  const currentColor = isDragging ? thumbDragColor : thumbColor;
  const currentScale = isDragging ? 2 : 1;

  return (
    <div ref={containerRef} className={`relative h-full ${className}`}>
      {/* Scrollable content - hide native scrollbar */}
      <div
        ref={contentRef}
        className={`absolute inset-0 overflow-y-auto hide-scrollbar ${contentClassName}`}
      >
        {children}
      </div>

      {/* Custom scrollbar track - 50px hit area on each side, highest z-index */}
      {showScrollbar && (
        <div
          ref={trackRef}
          className="absolute top-0 h-full cursor-pointer z-[100]"
          style={{
            width: 100 + thumbWidth, // 50px on each side + thumb width
            left: position === 'left' ? -50 : 'auto',
            right: position === 'right' ? -50 : 'auto',
          }}
          onClick={handleTrackClick}
        >
          {/* Thumb */}
          <div
            ref={thumbRef}
            className="absolute rounded-full cursor-grab active:cursor-grabbing"
            style={{
              height: thumbHeight,
              width: thumbWidth,
              top: thumbTop + overscroll,
              left: position === 'left' ? 50 : 'auto',
              right: position === 'right' ? 50 : 'auto',
              backgroundColor: currentColor,
              transform: `scale(${currentScale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease, top 0.15s ease-out',
              willChange: 'transform, background-color, top',
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </div>
  );
}
