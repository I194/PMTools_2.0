import React, { FC, useEffect } from 'react';
import { OnSelectionChange, useSelectionContainer } from 'react-drag-to-select';
import { UseSelectionContainerParams } from 'react-drag-to-select/dist/hooks/useSelectionContainer';

// export interface MouseSelectionProps extends Pick<UseSelectionContainerParams<HTMLElement>, 'onSelectionChange'> {}

export interface MouseSelectionProps {
  onSelectionChange: OnSelectionChange;
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
      console.log('OnSelectionStart');
    },
    onSelectionEnd: () => {
      console.log('OnSelectionEnd');
    },
    selectionProps: {
      style: {
        border: '2px dashed purple',
        borderRadius: 2,
        opacity: 0.5,
      },
    },
  });

  return <DragSelection />;
};

export default React.memo(MouseSelection);