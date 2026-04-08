import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './VGP.module.scss';
import { IDirData, VGPData } from '../../../utils/GlobalTypes';
import SitesDataTable from '../DataTablesDIR/SitesDataTable/SitesDataTable';
import VGPDataTable from '../DataTablesDIR/VGPDataTable/VGPDataTable';
import Graphs from './Graphs';
import { Typography, Button } from '@mui/material';
import { UploadButton, ReferenceSelector } from '../../Common/Buttons';
import { useAppDispatch, useAppSelector } from '../../../services/store/hooks';
import { sitesFileToLatLon } from '../../../services/axios/filesAndData';
import { useTheme } from '@mui/material/styles';
import {
  textColor,
  primaryColor,
  successColor,
  bgColorBlocks,
  boxShadowStyle,
} from '../../../utils/ThemeConstants';
import { useTranslation } from 'react-i18next';
import VGPMean from './VGPMean';
import { SiteRow, SitesDataTableHandle } from '../DataTablesDIR/types';
import calculateVGP from '../../../utils/statistics/calculation/calculateVGP';
import Direction from '../../../utils/graphs/classes/Direction';
import { setVGPData } from '../../../services/reducers/dirPage';
import { setSiteData } from '../../../services/reducers/parsedData';
import { Reference } from '../../../utils/graphs/types';

type Props = {
  data: IDirData;
};

const VGPmodalContent: FC<Props> = ({ data }) => {
  const theme = useTheme();
  const { t } = useTranslation('translation');
  const dispatch = useAppDispatch();

  const sitesTableRef = useRef<SitesDataTableHandle>(null);
  const [vgpCache, setVgpCache] = useState<{ geo: VGPData; strat: VGPData } | null>(null);

  const { hiddenDirectionsIDs, reversedDirectionsIDs, reference } = useAppSelector(
    (state) => state.dirPageReducer,
  );

  const handleUpload = (event: any, files?: Array<File>) => {
    const acceptedFile = files ? files[0] : event.currentTarget.files[0];
    dispatch(sitesFileToLatLon(acceptedFile));
  };

  const calculateVGPs = () => {
    const rows = sitesTableRef.current?.getRows() || [];
    if (!rows.length) return;
    const visibleRows = rows.filter((row) => !hiddenDirectionsIDs.includes(Number(row.id)));

    const buildVGPData = (ref: Reference): VGPData => {
      return visibleRows.map((row) => {
        const { id, label, lat, lon, age, plateId } = row;
        const interpretation = data.interpretations.find((interp) => interp.id === id)!;

        const { Dgeo, Igeo, Dstrat, Istrat } = interpretation;
        let geoDirection = new Direction(Dgeo, Igeo, 1);
        let stratDirection = new Direction(Dstrat, Istrat, 1);
        if (reversedDirectionsIDs.includes(Number(id))) {
          geoDirection = geoDirection.reversePolarity();
          stratDirection = stratDirection.reversePolarity();
        }

        const dec =
          ref === 'geographic'
            ? +geoDirection.declination.toFixed(1)
            : +stratDirection.declination.toFixed(1);
        const inc =
          ref === 'geographic'
            ? +geoDirection.inclination.toFixed(1)
            : +stratDirection.inclination.toFixed(1);
        const a95 = ref === 'geographic' ? interpretation.MADgeo : interpretation.MADstrat;

        const vgp = calculateVGP(dec, inc, lat, lon, a95);
        const dp: number = vgp?.dp || 0;
        const dm: number = vgp?.dm || 0;

        return {
          id,
          label,
          dec,
          inc,
          a95,
          lat,
          lon,
          age,
          plateId,
          ...vgp,
          dp,
          dm,
        };
      });
    };

    const geoData = buildVGPData('geographic');
    const stratData = buildVGPData('stratigraphic');
    const cache = { geo: geoData, strat: stratData };

    setVgpCache(cache);
    dispatch(setVGPData(reference === 'geographic' ? cache.geo : cache.strat));

    dispatch(
      setSiteData({
        data: rows.map((r) => ({ lat: r.lat, lon: r.lon, age: r.age, plateId: r.plateId })),
        format: 'edited',
        created: new Date().toISOString(),
      }),
    );
  };

  const deleteData = () => {
    setVgpCache(null);
    dispatch(setVGPData(null));
    dispatch(setSiteData(null));
  };

  useEffect(() => {
    if (vgpCache) {
      dispatch(setVGPData(vgpCache[reference === 'geographic' ? 'geo' : 'strat']));
    }
  }, [reference, vgpCache, dispatch]);

  return (
    <div className={styles.modalContent}>
      <div className={styles.topCenter}>
        <div className={styles.import}>
          <Typography color={textColor(theme.palette.mode)}>{t('vgp.upload.first')}</Typography>
          <div className={styles.upload}>
            <UploadButton
              accept={['.csv', '.xlsx']}
              onUpload={handleUpload}
              label={`${t('vgp.upload.button')} (.csv, .xlsx)`}
              extraId="vgp"
            />
          </div>
          <Typography color={textColor(theme.palette.mode)}>
            {t('vgp.upload.second')}{' '}
            <code style={{ color: primaryColor(theme.palette.mode) }}>lat</code> &{' '}
            <code style={{ color: primaryColor(theme.palette.mode) }}>lon</code>.
          </Typography>
        </div>
        <div className={styles.import}>
          <Typography color={textColor(theme.palette.mode)}>
            {t('vgp.upload.third')}{' '}
            <code style={{ color: primaryColor(theme.palette.mode) }}>age</code> &{' '}
            <code style={{ color: primaryColor(theme.palette.mode) }}>plate_id</code>
            {t('vgp.upload.fourth')}{' '}
            <code style={{ color: successColor(theme.palette.mode) }}>GPlates</code>
          </Typography>
        </div>
      </div>
      <div
        className={styles.controls}
        style={{
          backgroundColor: bgColorBlocks(theme.palette.mode),
          boxShadow: boxShadowStyle(theme.palette.mode),
        }}
      >
        <Button
          variant="outlined"
          onClick={deleteData}
          sx={{
            textTransform: 'none',
            color: textColor(theme.palette.mode),
          }}
        >
          {t('vgp.dataManipulation.clear')}
        </Button>
        <Button
          variant="contained"
          onClick={calculateVGPs}
          sx={{
            textTransform: 'none',
          }}
        >
          {t('vgp.dataManipulation.calculate')}
        </Button>
        <ReferenceSelector availableReferences={['geographic', 'stratigraphic']} />
        <VGPMean />
      </div>
      <div className={styles.data}>
        <div className={styles.input}>
          <SitesDataTable ref={sitesTableRef} data={data} />
        </div>
        <div className={styles.vgpTable}>
          <VGPDataTable />
        </div>
        <Graphs />
      </div>
    </div>
  );
};

export default VGPmodalContent;
