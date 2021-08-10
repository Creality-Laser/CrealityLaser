import React from 'react';
import Visualizer from './Visualizer';
import styles from './index.module.scss';

const LaserVisualizerWidget = () => (
  <div className={styles.visualizer_content}>
    <Visualizer />
  </div>
);

export default LaserVisualizerWidget;
