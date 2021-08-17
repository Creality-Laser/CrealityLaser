import React, { useCallback, useState, useEffect } from 'react';
import { Progress } from 'antd';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { CNC_LASER_STAGE } from '../../../../flux/editor';
import styles from './index.module.scss';

function formatTime(t) {
  const hours = Math.floor(t / 3600);
  const minutes = Math.ceil((t - hours * 3600) / 60);
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

const failedStatus = [
  CNC_LASER_STAGE.GENERATE_TOOLPATH_FAILED,
  CNC_LASER_STAGE.PREVIEW_FAILED,
  CNC_LASER_STAGE.GENERATE_GCODE_FAILED,
];

function ProgressInfo(props) {
  const { stage, progress, gcodeFile } = props;

  const [showProgressBar, setShowProgressBar] = useState(false);
  const { t } = useTranslation();

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
        return `${t('Generating tool path...', {
          progress: `${(100.0 * progress).toFixed(2)}%`,
        })}`;
      case CNC_LASER_STAGE.GENERATE_TOOLPATH_SUCCESS:
        return t('Generated tool path successfully.');
      case CNC_LASER_STAGE.GENERATE_TOOLPATH_FAILED:
        return t('Failed to generate tool path.');
      case CNC_LASER_STAGE.PREVIEWING:
        return t('Previewing tool path...');
      case CNC_LASER_STAGE.PREVIEW_SUCCESS:
        return t('Previewed tool path successfully');
      case CNC_LASER_STAGE.PREVIEW_FAILED:
        return t('Failed to preview tool path.');
      case CNC_LASER_STAGE.GENERATING_GCODE:
        return `${t('Generating G-code...', {
          progress: `${(100.0 * progress).toFixed(2)}%`,
        })}`;
      case CNC_LASER_STAGE.GENERATE_GCODE_SUCCESS:
        return t('Generated G-code successfully.');
      case CNC_LASER_STAGE.GENERATE_GCODE_FAILED:
        return t('Failed to generate G-code.');
      default:
        return '';
    }
  }, [stage, t, progress]);

  const notice = getNotice();

  const progressStatusFailed = stage && failedStatus.includes(stage);

  const isGenGcodeSucc =
    stage === CNC_LASER_STAGE.GENERATE_GCODE_SUCCESS &&
    gcodeFile &&
    gcodeFile.printTime;
  const estimatedTime = isGenGcodeSucc && gcodeFile.printTime;

  return (
    <>
      {!showProgressBar && estimatedTime && (
        <div className={styles.print_time_info}>
          <TimeIcon />
          <span>&nbsp;&nbsp;</span>
          {formatTime(estimatedTime)}
        </div>
      )}
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
    </>
  );
}

ProgressInfo.propTypes = {
  stage: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  gcodeFile: PropTypes.object,
};

export default ProgressInfo;

const TimeIcon = () => (
  <svg
    t="1628749907189"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="18606"
    width="200"
    height="200"
  >
    <path
      d="M959.676507 516.710278c0-1.440815-0.017396-2.87856-0.030699-4.316306 0.014326-1.437745 0.030699-2.874467 0.030699-4.315282 0-244.530272-200.372563-442.760033-447.545012-442.760033-247.172449 0-447.545012 198.22976-447.545012 442.760033 0 1.440815 0.016373 2.87856 0.030699 4.315282-0.014326 1.437745-0.030699 2.87549-0.030699 4.316306 0 244.530272 200.372563 442.760033 447.545012 442.760033C759.304967 959.469288 959.676507 761.240551 959.676507 516.710278zM512.130472 875.188766c-196.127889 0-355.123067-160.496367-355.123067-358.477464 0-0.856507 0.016373-1.708921 0.023536-2.563382l0.032746 0c-0.00921-0.583285-0.008186-1.169639-0.016373-1.753947 0.007163-0.584308 0.00614-1.170662 0.016373-1.753947l-0.032746 0c-0.007163-0.854461-0.023536-1.706875-0.023536-2.563382 0-197.981097 158.995177-358.477464 355.123067-358.477464 196.130959 0 355.125113 160.496367 355.125113 358.477464 0 0.856507-0.016373 1.708921-0.023536 2.563382l-0.031722 0c0.010233 0.583285 0.00921 1.169639 0.016373 1.753947-0.007163 0.584308-0.00614 1.170662-0.016373 1.753947l0.031722 0c0.008186 0.854461 0.023536 1.706875 0.023536 2.563382C867.255585 714.692399 708.261431 875.188766 512.130472 875.188766z"
      p-id="18607"
      fill="#2c2c2c"
    ></path>
    <path
      d="M449.982016 506.389212c-0.689708 2.479471-1.066285 5.089925-1.066285 7.788383l0 33.851992c0 16.019859 12.986779 29.007661 29.007661 29.007661l261.847683 0c16.019859 0 29.007661-12.986779 29.007661-29.007661l0-33.851992c0-16.019859-12.986779-29.007661-29.007661-29.007661L541.84933 485.169935 541.84933 230.79034c0-16.020882-12.986779-29.007661-29.007661-29.007661l-33.851992 0c-16.019859 0-29.007661 12.985756-29.007661 29.007661L449.982016 506.389212z"
      p-id="18608"
      fill="#2c2c2c"
    ></path>
  </svg>
);
