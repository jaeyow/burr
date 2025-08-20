import React, { ReactNode, useEffect, useState, useRef, useCallback } from 'react';

type TwoPanelLayoutProps = {
  firstItem: ReactNode;
  secondItem: ReactNode;
  mode: 'half' | 'first-minimal' | 'third' | 'expanding-second';
  animateSecondPanel?: boolean;
};

type ResizableTwoPanelLayoutProps = {
  firstItem: ReactNode;
  secondItem: ReactNode;
  mode: 'half' | 'first-minimal' | 'third' | 'expanding-second';
  animateSecondPanel?: boolean;
  minSecondPanelWidth?: number;
  defaultSecondPanelWidth?: number;
};

type ResizableTwoRowLayoutProps = {
  firstItem: ReactNode;
  secondItem: ReactNode;
  minFirstPanelHeight?: number;
  defaultFirstPanelHeight?: number;
};
/**
 * A layout component that takes two children and renders them.
 *
 * This is an ugly monolith as we specifically want this to be the same object
 * across react renders (which can be finnicky), as we want the state of the
 * contents to be preserved. This allows you to toglge full screen.
 *
 * TODO -- manage the state of the contents better so we can split this into
 * multiple separate component types.
 *
 */
export const TwoColumnLayout: React.FC<TwoPanelLayoutProps> = ({
  firstItem: firstColumnContent,
  secondItem: secondColumnContent,
  mode,
  animateSecondPanel = false
}) => {
  const [showSecondPanel, setShowSecondPanel] = React.useState(animateSecondPanel);
  useEffect(() => {
    if (mode === 'expanding-second') {
      setShowSecondPanel(animateSecondPanel);
    }
  }, [animateSecondPanel, mode]);
  if (mode === 'first-minimal') {
    return (
      <div className={`flex h-full w-full ${mode === 'first-minimal' ? 'flex flex-1' : ''}`}>
        <div className="h-full">{firstColumnContent}</div>
        <div className="h-full grow">{secondColumnContent}</div>
      </div>
    );
  }
  if (mode === 'third') {
    return (
      <div className={`flex h-full w-full' : ''}`}>
        <div className="w-1/3 h-full">{firstColumnContent}</div>
        <div className="w-2/3 h-full">{secondColumnContent}</div>
      </div>
    );
  }
  if (mode === 'expanding-second') {
    return (
      <div
        className={`flex h-full w-full transition-all duration-500 ${mode === 'expanding-second' && showSecondPanel ? 'overflow-hidden' : ''}`}
      >
        <div
          className={`h-full ${mode === 'expanding-second' ? 'transition-all duration-500' : ''} ${showSecondPanel ? 'w-1/2' : 'w-full'}`}
        >
          {firstColumnContent}
        </div>
        {mode === 'expanding-second' && (
          <div
            className={`h-full ${showSecondPanel ? 'w-1/2' : 'w-0'} transition-all duration-500 overflow-hidden`}
          >
            {secondColumnContent}
          </div>
        )}
        {mode !== 'expanding-second' && (
          <div className={`w-1/2 h-full ${mode === 'third' ? 'w-2/3' : 'w-1/2'}`}>
            {secondColumnContent}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex h-full w-full">
      <div className="w-1/2 h-full">{firstColumnContent}</div>
      <div className="w-1/2 h-full">{secondColumnContent}</div>
    </div>
  );
};

export const TwoRowLayout: React.FC<TwoPanelLayoutProps> = ({
  firstItem: topRowContent,
  secondItem: bottomRowContent
}) => {
  return (
    <div className="flex flex-col h-full w-full gap-2">
      <div className="h-1/2 overflow-auto">{topRowContent}</div>
      <div className="h-1/2">{bottomRowContent}</div>
    </div>
  );
};

export const ResizableTwoColumnLayout: React.FC<ResizableTwoPanelLayoutProps> = ({
  firstItem: firstColumnContent,
  secondItem: secondColumnContent,
  mode,
  animateSecondPanel = false,
  minSecondPanelWidth = 300,
  defaultSecondPanelWidth = 400
}) => {
  const [showSecondPanel, setShowSecondPanel] = useState(animateSecondPanel);
  const [secondPanelWidth, setSecondPanelWidth] = useState(defaultSecondPanelWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'expanding-second') {
      setShowSecondPanel(animateSecondPanel);
    }
  }, [animateSecondPanel, mode]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;

      // Enforce minimum width and don't let it get larger than 80% of container
      const maxWidth = containerRect.width * 0.8;
      const clampedWidth = Math.max(minSecondPanelWidth, Math.min(newWidth, maxWidth));

      setSecondPanelWidth(clampedWidth);
    },
    [isResizing, minSecondPanelWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // For modes other than 'half', use the original behavior
  if (mode === 'first-minimal') {
    return (
      <div className={`flex h-full w-full ${mode === 'first-minimal' ? 'flex flex-1' : ''}`}>
        <div className="h-full">{firstColumnContent}</div>
        <div className="h-full grow">{secondColumnContent}</div>
      </div>
    );
  }

  if (mode === 'third') {
    return (
      <div className={`flex h-full w-full' : ''}`}>
        <div className="w-1/3 h-full">{firstColumnContent}</div>
        <div className="w-2/3 h-full">{secondColumnContent}</div>
      </div>
    );
  }

  if (mode === 'expanding-second') {
    return (
      <div
        className={`flex h-full w-full transition-all duration-500 ${mode === 'expanding-second' && showSecondPanel ? 'overflow-hidden' : ''
          }`}>
        <div
          className={`h-full ${mode === 'expanding-second' ? 'transition-all duration-500' : ''
            } ${showSecondPanel ? 'w-1/2' : 'w-full'}`}>
          {firstColumnContent}
        </div>
        {mode === 'expanding-second' && (
          <div
            className={`h-full ${showSecondPanel ? 'w-1/2' : 'w-0'
              } transition-all duration-500 overflow-hidden`}>
            {secondColumnContent}
          </div>
        )}
        {mode !== 'expanding-second' && (
          <div className={`w-1/2 h-full ${mode === 'third' ? 'w-2/3' : 'w-1/2'}`}>
            {secondColumnContent}
          </div>
        )}
      </div>
    );
  }

  // Default 'half' mode with resizable panels
  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div className="h-full" style={{ width: `calc(100% - ${secondPanelWidth}px)` }}>
        {firstColumnContent}
      </div>

      {/* Resize Handle */}
      <div
        className={`w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 transition-colors ${isResizing ? 'bg-gray-400' : ''
          }`}
        onMouseDown={handleMouseDown}
        style={{ minWidth: '4px' }}
      />

      <div className="h-full flex-shrink-0" style={{ width: `${secondPanelWidth}px` }}>
        {secondColumnContent}
      </div>
    </div>
  );
};

export const ResizableTwoRowLayout: React.FC<ResizableTwoRowLayoutProps> = ({
  firstItem: firstRowContent,
  secondItem: secondRowContent,
  minFirstPanelHeight = 200,
  defaultFirstPanelHeight = 300
}) => {
  const [firstPanelHeight, setFirstPanelHeight] = useState(defaultFirstPanelHeight);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = e.clientY - containerRect.top;

      // Enforce minimum height and don't let it get larger than 80% of container
      const maxHeight = containerRect.height * 0.8;
      const clampedHeight = Math.max(minFirstPanelHeight, Math.min(newHeight, maxHeight));

      setFirstPanelHeight(clampedHeight);
    },
    [isResizing, minFirstPanelHeight]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <div className="w-full flex-shrink-0" style={{ height: `${firstPanelHeight}px` }}>
        {firstRowContent}
      </div>

      {/* Resize Handle */}
      <div
        className={`h-1 bg-gray-300 hover:bg-gray-400 cursor-row-resize flex-shrink-0 transition-colors ${isResizing ? 'bg-gray-400' : ''
          }`}
        onMouseDown={handleMouseDown}
        style={{ minHeight: '4px' }}
      />

      <div className="w-full" style={{ height: `calc(100% - ${firstPanelHeight}px - 4px)` }}>
        {secondRowContent}
      </div>
    </div>
  );
};
