import React from "react";
import { Button } from "@mui/material";
import { ButtonProps } from "@mui/material";
import { useMediaQuery } from "react-responsive";

const DefaultButton = <C extends React.ElementType>(
  props: ButtonProps<C, { component?: C; buttonRef?: React.Ref<HTMLButtonElement> }>
) => {
  const { children, buttonRef, ...rest } = props;
  const widthLessThan720 = useMediaQuery({ maxWidth: 720 });
  const widthLessThan1920 = useMediaQuery({ maxWidth: 1920 });

  return (
    <Button
      ref={buttonRef} 
      {...rest}
      sx={{
        textTransform: 'none',
        borderRadius: '8px',
        fontWeight: 500,
        fontSize: widthLessThan720 ? '12px' : widthLessThan1920 ? '14px' : '16px',
        width: 'fit-content',
        whiteSpace: 'nowrap',
        ...rest.sx
      }}
    >
      { children }
    </Button>
  );
};

export default DefaultButton;

