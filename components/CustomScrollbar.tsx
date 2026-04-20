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
}: CustomScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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

  // Calculate dynamic sizes
  const currentWidth = isDragging ? thumbWidth * 2 : thumbWidth;
  const currentHeight = isDragging ? thumbHeight * 2 : thumbHeight;
  const currentColor = isDragging ? thumbDragColor : thumbColor;

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
            width: 100 + currentWidth, // 50px on each side + thumb width
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
              height: currentHeight,
              width: currentWidth,
              top: thumbTop + overscroll,
              left: position === 'left' ? 50 : 'auto',
              right: position === 'right' ? 50 : 'auto',
              backgroundColor: currentColor,
              transition: 'width 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.1s ease-out, top 0.1s ease-out',
            }}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </div>
  );
}
