import React, { FC, useMemo } from 'react';
import styles from './ChangelogModal.module.scss';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { textColor } from '../../../../utils/ThemeConstants';
import { CHANGELOG, ChangelogEntry } from '../../../../data/changelog';

const parseVersion = (version: string): number[] => {
  return version.split('.').map((part) => Number(part));
};

const compareVersionsDesc = (a: string, b: string): number => {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const ai = pa[i] ?? 0;
    const bi = pb[i] ?? 0;
    if (ai !== bi) return bi - ai;
  }
  return 0;
};

const ChangelogModal: FC = () => {
  const theme = useTheme();
  const curVersion = process.env.REACT_APP_VERSION || '';

  const entries: ChangelogEntry[] = useMemo(() => {
    const copy = [...CHANGELOG];
    copy.sort((e1, e2) => compareVersionsDesc(e1.version, e2.version));
    return copy;
  }, []);

  return (
    <div className={styles.container}>
      <Typography
        variant="h6"
        className={styles.title}
        color={textColor(theme.palette.mode)}
      >
        Changelog
      </Typography>
      <div className={styles.list}>
        {entries.map((e) => {
          const isCurrent = curVersion === e.version;
          return (
            <div className={styles.entry} key={e.version}>
              <div className={styles.entryHeader}>
                <Typography
                  variant="subtitle1"
                  className={styles.version}
                  color={textColor(theme.palette.mode)}
                  sx={{ fontWeight: isCurrent ? 700 : 600 }}
                >
                  v{e.version}
                  {isCurrent ? ' (current)' : ''}
                </Typography>
                {e.date && (
                  <Typography
                    variant="body2"
                    className={styles.date}
                    color={textColor(theme.palette.mode)}
                  >
                    {e.date}
                  </Typography>
                )}
              </div>
              {e.items && e.items.length > 0 && (
                <ul className={styles.items}>
                  {e.items.map((item, idx) => (
                    <li key={idx}>
                      <Typography
                        variant="body2"
                        color={textColor(theme.palette.mode)}
                      >
                        {item}
                      </Typography>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChangelogModal;


