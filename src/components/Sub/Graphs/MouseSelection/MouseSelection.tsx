import React, { FC, useEffect } from 'react';
import { OnSelectionChange, useSelectionContainer } from 'react-drag-to-select';
import { UseSelectionContainerParams } from 'react-drag-to-select/dist/hooks/useSelectionContainer';

// export interface MouseSelectionProps extends Pick<UseSelectionContainerParams<HTMLElement>, 'onSelectionChange'> {}

export interface MouseSelectionProps {
  onSelectionChange: OnSelectionChange;
  onSelectionEnd?: () => void;
  eventsElement: HTMLElement | Window | null;
}

const MouseSelection: FC<MouseSelectionProps> = ({ 
  onSelectionChange, 
  eventsElement, 
}) => {

  const { DragSelection } = useSelectionContainer({
    eventsElement,
    onSelectionChange,
    onSelectionStart: () => {
    },
    onSelectionEnd: () => {
    },
    selectionProps: {
      style: {
        border: '2px dashed purple',
        borderRadius: 2,
        opacity: 0.5,
        translate: '500px 500px',
        position: 'absolute'
      },
    },
  });

  return <DragSelection />;
};

export default React.memo(MouseSelection);