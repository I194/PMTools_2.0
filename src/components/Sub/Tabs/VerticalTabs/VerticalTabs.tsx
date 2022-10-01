import * as React from 'react';
import styles from './VerticalTabs.module.scss';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { useTheme } from "@mui/material/styles";
import { textColor } from "../../../../utils/ThemeConstants";

interface TabPanelProps {
  children?: React.ReactNode;
  label: string;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {

  const { children, value, index, label, ...other } = props;

  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{
        width: '100%',
      }}
      {...other}
    >
      {value === index && (
        <div className={styles.wrapper}>
          <div className={styles.content}>
            <Typography variant='h5' color={textColor(theme.palette.mode)} textAlign='center' mb='16px'>
              { label }
            </Typography>
            { children }
          </div>
        </div>
      )}
    </div>
  );
}

const a11yProps = (index: number) => ({
  id: `vertical-tab-${index}`,
  'aria-controls': `vertical-tabpanel-${index}`,
});

type TabsProps = {
  content: Array<{
    label: string;
    content: React.ReactNode;
  }>;
}

const VerticalTabs = ({ content }: TabsProps) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ 
          borderRight: 1, 
          borderColor: 'divider',
          // minWidth: 'fit-content', 
          maxWidth: '20vw',
        }}
      >
        {
          content.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              {...a11yProps(index)}
              sx={{
                textTransform: 'none',
              }}
            /> 
          ))
        }
      </Tabs>
      {
        content.map((tab, index) => (
          <TabPanel
            key={index}
            value={value}
            index={index}
            label={tab.label}
          >
            {tab.content}
          </TabPanel>
        ))
      }
    </>
  );
};

export default VerticalTabs;
