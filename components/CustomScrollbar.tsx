'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface CustomScrollbarProps {
  children: ReactNode;
  className?: string;
  thumbHeight?: number;
  thumbColor?: string;
}

export default function CustomScrollbar({
  children,
  className = '',
  thumbHeight = 40,
  thumbColor = 'hsl(210, 100%, 48%)',
}: CustomScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
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

  // Handle scroll event
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => updateThumbPosition();
    content.addEventListener('scroll', handleScroll);

    // Initial check
    updateThumbPosition();

    // Recheck on resize
    const resizeObserver = new ResizeObserver(() => updateThumbPosition());
    resizeObserver.observe(content);

    return () => {
      content.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
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
      content.scrollTop = dragStartScrollTop.current + scrollDelta;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
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

  return (
    <div ref={containerRef} className={`relative flex flex-col ${className}`}>
      {/* Scrollable content - hide native scrollbar */}
      <div
        ref={contentRef}
        className="flex-1 min-h-0 overflow-y-auto pr-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {children}
      </div>

      {/* Custom scrollbar track */}
      {showScrollbar && (
        <div
          ref={trackRef}
          className="absolute top-0 right-0 w-1 h-full cursor-pointer"
          onClick={handleTrackClick}
        >
          {/* Thumb */}
          <div
            ref={thumbRef}
            className={`absolute right-0 w-1 rounded-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
            style={{
              height: thumbHeight,
              top: thumbTop,
              backgroundColor: thumbColor,
              transition: isDragging ? 'none' : 'top 0.1s ease-out',
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </div>
  );
}
