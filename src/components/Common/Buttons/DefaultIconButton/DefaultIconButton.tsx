import React from "react";
import { IconButton } from "@mui/material";
import { IconButtonProps } from "@mui/material";
import { useMediaQuery } from "react-responsive";

const DefaultIconButton = <C extends React.ElementType>(
  props: IconButtonProps<C, { component?: C; buttonRef?: React.Ref<HTMLButtonElement> }>
) => {
  const { children, buttonRef, ...rest } = props;
  const widthLessThan720 = useMediaQuery({ maxWidth: 720 });
  const widthLessThan1920 = useMediaQuery({ maxWidth: 1920 });

  return (
    <IconButton
      ref={buttonRef} 
      {...rest}
      sx={{
        borderRadius: '8px',
        ...rest.sx
      }}
    >
      { children }
    </IconButton>
  );
};

export default DefaultIconButton;

