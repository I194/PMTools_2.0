import React, { FC } from "react";
import styles from './UploadButtom.module.scss';
import { Input, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  textColor
} from '../../../../utils/ThemeConstants';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

type Props = {
  onUpload: (event: any, files?: Array<File>) => void;
  accept: Array<string>;
  dndInputProps?: any;
  label?: string;
  extraId?: string;
}

const UploadButton: FC<Props> = ({ onUpload, accept, dndInputProps, label='Загрузить файл', extraId='1' }) => {

  const theme = useTheme();

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (event: any, files?: Array<File>)  => {
    // if (!!dndInputProps) return;
    onUpload(event, files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <label 
      htmlFor={`file-input-${extraId}`} 
      style={{
        flex: 'auto'
      }}
    >
      <Input 
        // id="upload-site-latlon-top"
        type={'file'}  
        inputProps={{
          // ...dndInputProps,
          multiple: true,
          accept: accept.join(', '),
          id: `file-input-${extraId}`,
          ref: inputRef
        }}
        disableUnderline={true}
        sx={{display: 'none'}}
        onChange={handleChange}
      />
      <Button 
        variant="outlined" 
        startIcon={<UploadFileOutlinedIcon />}
        sx={{
          textTransform: 'none', 
          width: '100%',
          color: textColor(theme.palette.mode),
        }}
        component="span"
      >
        { label }
      </Button>
    </label>
  );
}

export default UploadButton;
