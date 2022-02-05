import React, { FC } from 'react';
import { DataTable } from '../../components/Main';
import styles from './PCAPage.module.scss';

const PCAPage: FC = ({}) => {
  return (
    <div>
      <div className={styles.instruments}>
        <div className={styles.dataSettings}>

        </div>
      </div>
      <div className={styles.data}>
        <div className={styles.tables}>
          <div className={styles.tableSmall}>

          </div>
          <div className={styles.tableLarge}>
            <DataTable />
          </div>
        </div>
        <div className={styles.graphs}>
          <div className={styles.graphLarge}>

          </div>
          <div className={styles.column}>
            <div className={styles.graphSmall}>

            </div>
            <div className={styles.graphSmall}>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PCAPage;
