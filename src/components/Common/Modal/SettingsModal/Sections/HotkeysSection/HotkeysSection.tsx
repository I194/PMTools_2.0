import React, { useEffect } from "react";
import styles from "./HotkeysSection.module.scss";
import { Button, Divider, Typography } from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { textColor, bgColorBlocks } from "../../../../../../utils/ThemeConstants";

import { useForm } from "react-hook-form";
import { HotkeysType } from "../../../../../../utils/GlobalTypes";
import { useAppDispatch, useAppSelector } from "../../../../../../services/store/hooks";
import { setHotkeys } from "../../../../../../services/reducers/appSettings";
import { useTranslation } from "react-i18next";
import { useDefaultHotkeys } from "../../../../../../utils/GlobalHooks";

const HotkeysSection = () => {

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const defaultHotkeys = useDefaultHotkeys();
  const { t, i18n } = useTranslation('translation');
  
  // const hotkeys: HotkeysType = JSON.parse(localStorage.getItem('hotkeys')!); // Они всегда будут в локальном хранилище, см. loadHotkeys()
  const { register, setValue, getValues, setError, formState: { errors }, clearErrors, watch  } = useForm();
  const { hotkeys } = useAppSelector(state => state.appSettingsReducer);

  useEffect(() => {
    hotkeys.map(block => {
      // const defaultBlock = defaultHotkeys?.find(defaultBlock => defaultBlock.id === block.id);
      block.hotkeys.map(hotkey => {
        register(hotkey.label);
        setValue(hotkey.label, hotkey.hotkey);
        // defaultBlock?.hotkeys.find(defaultHotkey => defaultHotkey.id === hotkey.id)?.label || hotkey.label
      });
    })
  }, [hotkeys]);

  const handleHotkeyChange = (event: React.KeyboardEvent<HTMLSpanElement>, label: string) => {
    event.preventDefault();

    const { key, code } = event;
    const currentKeyIndex = hotkeys.findIndex(block => block.title === label);
    const allCurrentCodes = Object.keys(getValues())
      .map(key => getValues()[key].code)
      .filter((code, index) => index !== currentKeyIndex);

    if (allCurrentCodes.includes(code)) setError(label, { message: t("settings.hotkeys.buttonAlreadyUsed") })
    else clearErrors(label);

    setValue(label, { key: key.length === 1 ? key.toUpperCase() : key, code });
  };

  useEffect(() => {
    const subscription = watch((allValues) => {
      const allCurrentCodes = Object.keys(allValues).map(key => allValues[key].code);
      allCurrentCodes.forEach((code, index) => {
        const codeOccurences = allCurrentCodes.filter(currentCode => currentCode === code).length;
        const label = Object.keys(allValues)[index];
        if (codeOccurences > 1) {
          setError(label, { message: t('settings.hotkeys.buttonAlreadyUsed') });
        } else {
          clearErrors(label);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleSave = () => {
    const newHotkeys: HotkeysType = hotkeys.map(block => {
      const newHotkeysBlock = block.hotkeys.map(hotkey => {
        const { key, code } = getValues(hotkey.label);
        return { ...hotkey, hotkey: {key, code} };
      }); 
      return { ...block, hotkeys: newHotkeysBlock };
    });
    dispatch(setHotkeys(newHotkeys));
    alert(t('settings.onSaveMessage'));
  };

  const toDefault = () => {
    dispatch(setHotkeys(defaultHotkeys));
    defaultHotkeys.map(block => {
      block.hotkeys.map(hotkey => {
        setValue(hotkey.label, hotkey.hotkey);
      });
    });
    alert(t('settings.onDefaulSettings'));
  };

  return (
    <div className={styles.container}>
      {
        hotkeys.map((block, index) => (
          <div key={index} className={styles.block}>
            <Typography variant="h6" color={textColor(theme.palette.mode)} mt={index === 0 ? '0' : '16px'}>
              {t(`settings.hotkeys.titles.${block.title}`)}
            </Typography>
            <Divider />
            {
              block.hotkeys.map((hotkey, index) => (
                <div 
                  key={index} 
                  className={styles.hotkeyRow}
                  style={{
                    borderBottomColor: bgColorBlocks(theme.palette.mode),
                  }}
                >
                  <Typography variant="body1" color={textColor(theme.palette.mode)}>
                    {t(`settings.hotkeys.titles.${hotkey.label}`)}
                  </Typography>
                  <div className={styles.hotkeyBlock}>
                    <Typography variant="body1" color='error' mr='16px'>
                      {errors[hotkey.label]?.message}
                    </Typography>
                    <div 
                      className={styles.hotkey}
                      style={{
                        backgroundColor: hotkey?.disabled ? 'transparent' : bgColorBlocks(theme.palette.mode),
                      }}
                      tabIndex={-1}
                    >
                      <Typography 
                        variant="h6" 
                        color='primary' 
                        textAlign='center'
                        sx={{
                          width: '100%',
                          outline: 'none',
                          borderRadius: '6px',
                          '&:focus': {
                            boxShadow: '0px 0px 5px 1px #119dff',
                          },
                          '&:hover': {
                            boxShadow: hotkey?.disabled ? 'none' : '0px 0px 5px 1px #119dff',
                          },
                          userSelect: 'none',
                        }}
                        contentEditable={!hotkey?.disabled}
                        onKeyDown={(event) => handleHotkeyChange(event, hotkey.label)}
                        p='0 6px'
                      >
                        {/* {hotkey.hotkey.key} */}
                        { getValues(hotkey.label)?.key }
                      </Typography>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        ))
      }
      <div className={styles.saveOrReload}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={Object.keys(errors).length > 0}
        >
          {t('settings.saveButton')}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={toDefault}
          sx={{
            ml: '16px',
          }}
        >
          {t('settings.toDefaultButton')}
        </Button>
      </div>
    </div>
  );
};

export default HotkeysSection;
