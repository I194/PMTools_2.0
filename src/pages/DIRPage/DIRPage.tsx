import React, { FC } from 'react';
import styles from './DIRPage.module.scss';

const DIRPage: FC = ({}) => {
  return (
    <>
      <div className={styles.instruments}>
        <div className={styles.dataSettings}>

        </div>
      </div>
      <div className={styles.data}>
        <div className={styles.tables}>
          <div className={styles.tableSmall}>

          </div>
          <div className={styles.tableLarge}>
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
    </>
  )
}

export default DIRPage;
