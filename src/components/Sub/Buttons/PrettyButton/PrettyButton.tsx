import { Button } from "@mui/material";
import React from "react";
import styles from "./PrettyButton.module.scss";
import { ButtonProps } from "@mui/material";

const PrettyButton = <C extends React.ElementType>(
  props: ButtonProps<C, { component?: C; buttonRef?: React.Ref<HTMLButtonElement> }>
) => {
  const { children, buttonRef, ...rest } = props;

  return (
    <Button
      variant="text" 
      color={'primary'}
      sx={{
        textTransform: 'none',
        marginRight: '16px',
        borderRadius: '18px',
        fontWeight: 500,
        fontSize: '16px',
        width: 'fit-content',
      }}
      component="span"
      ref={buttonRef} 
      {...rest}
    >
      { children }
    </Button>
  );
};

export default PrettyButton;

