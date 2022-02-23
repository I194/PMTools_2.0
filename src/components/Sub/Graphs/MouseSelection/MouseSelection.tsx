import React, { FC, useEffect } from 'react';
import { OnSelectionChange, useSelectionContainer } from 'react-drag-to-select';
// import { OnSelectionChange, useSelectionContainer } from "@air/react-drag-to-select";

// export interface MouseSelectionProps extends Pick<UseSelectionContainerParams<HTMLElement>, 'onSelectionChange'> {}

export interface MouseSelectionProps {
  onSelectionChange: OnSelectionChange;
  onSelectionEnd: () => void;
  eventsElement: HTMLElement | Window | null;
}

const MouseSelection: FC<MouseSelectionProps> = ({ 
  onSelectionChange,
  onSelectionEnd,
  eventsElement, 
}) => {

  const { DragSelection } = useSelectionContainer({
    eventsElement,
    onSelectionChange,
    onSelectionEnd,
    selectionProps: {
      style: {
        border: '2px dashed purple',
        borderRadius: 2,
        opacity: 0.5,
        position: 'absolute'
      },
    },
  });

  return <DragSelection />;
};

export default React.memo(MouseSelection);