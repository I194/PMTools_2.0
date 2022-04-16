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
  label?: string;
}

const UploadButton: FC<Props> = ({ onUpload, accept, label='Загрузить файл' }) => {

  const theme = useTheme();

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (event: any, files?: Array<File>)  => {
    onUpload(event, files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <label 
      htmlFor="file-input" 
      style={{
        flex: 'auto'
      }}
    >
      <Input 
        // id="upload-site-latlon-top"
        type={'file'}  
        inputProps={{
          multiple: false,
          accept: accept.join(', '),
          id: 'file-input',
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
