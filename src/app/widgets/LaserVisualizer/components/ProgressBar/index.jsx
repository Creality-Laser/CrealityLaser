import React, { useCallback, useState, useEffect } from 'react';
import { Progress } from 'antd';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { CNC_LASER_STAGE } from '../../../../flux/editor';
import styles from './index.module.scss';

const failedStatus = [
  CNC_LASER_STAGE.GENERATE_TOOLPATH_FAILED,
  CNC_LASER_STAGE.PREVIEW_FAILED,
  CNC_LASER_STAGE.GENERATE_GCODE_FAILED,
];

function ProgressInfo(props) {
  const { stage, progress } = props;

  const [showProgressBar, setShowProgressBar] = useState(false);

  useEffect(() => {
    const shouldShowProgressBarStages = [
      CNC_LASER_STAGE.GENERATING_TOOLPATH,
      CNC_LASER_STAGE.PREVIEWING,
      CNC_LASER_STAGE.GENERATING_GCODE,
    ];
    if (shouldShowProgressBarStages.includes(stage) && !showProgressBar) {
      setShowProgressBar(true);
    } else {
      setTimeout(() => {
        setShowProgressBar(false);
      }, 3000);
    }
  }, [stage, showProgressBar]);

  const getNotice = useCallback(() => {
    switch (stage) {
      case CNC_LASER_STAGE.EMPTY:
        return '';
      case CNC_LASER_STAGE.GENERATING_TOOLPATH:
        return `Generating tool path... ${(100.0 * progress).toFixed(2)}%`;
      case CNC_LASER_STAGE.GENERATE_TOOLPATH_SUCCESS:
        return 'Generated tool path successfully.';
      case CNC_LASER_STAGE.GENERATE_TOOLPATH_FAILED:
        return 'Failed to generate tool path.';
      case CNC_LASER_STAGE.PREVIEWING:
        return 'Previewing tool path...';
      case CNC_LASER_STAGE.PREVIEW_SUCCESS:
        return 'Previewed tool path successfully';
      case CNC_LASER_STAGE.PREVIEW_FAILED:
        return 'Failed to preview tool path.';
      case CNC_LASER_STAGE.GENERATING_GCODE:
        return `Generating G-code... ${(100.0 * progress).toFixed(2)}%`;
      case CNC_LASER_STAGE.GENERATE_GCODE_SUCCESS:
        return 'Generated G-code successfully.';
      case CNC_LASER_STAGE.GENERATE_GCODE_FAILED:
        return 'Failed to generate G-code.';
      default:
        return '';
    }
  }, [stage, progress]);

  const notice = getNotice();

  const progressStatusFailed = stage && failedStatus.includes(stage);

  return (
    <div
      className={classNames(styles.wrapper)}
      style={{ display: showProgressBar ? 'block' : 'none' }}
    >
      <p className={styles.notice}>{notice}</p>
      <div className={styles.progress_bar_wrapper}>
        <Progress
          percent={(progress * 100).toFixed(1)}
          status={progressStatusFailed ? 'exception' : 'active'}
          strokeColor={
            progressStatusFailed
              ? ''
              : {
                  from: '#4b90f2',
                  to: '#87d068',
                }
          }
        />
      </div>
    </div>
  );
}

ProgressInfo.propTypes = {
  stage: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
};

export default ProgressInfo;
