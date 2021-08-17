import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.scss';

function ParametersHead(props) {
  const { title, expanded, onToggleExpand } = props;

  return (
    <button type="button" className={styles.wrapper} onClick={onToggleExpand}>
      <span className={styles.icon}>
        <SettingsIcon />
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.handlebar_icon}>
        {expanded ? <DoubleUpIcon /> : <DoubleDownIcon />}
      </span>
    </button>
  );
}

ParametersHead.propTypes = {
  title: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
};

export default ParametersHead;

const DoubleUpIcon = () => (
  <svg
    t="1626400041173"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="1498"
    width="200"
    height="200"
  >
    <path
      d="M511.2 219.6L174.5 556.3c-25 25-65.4 25-90.4 0-24.9-25-24.9-65.4 0-90.4L463.4 86.6c0.8-0.9 1.7-1.8 2.5-2.7 25-25 65.4-25 90.4 0l381.3 381.3c25 25 25 65.4 0 90.4s-65.4 25-90.4 0l-336-336z"
      fill="#2c2c2c"
      p-id="1499"
    ></path>
    <path
      d="M511.5 601.6L174.8 938.3c-25 25-65.4 25-90.4 0-24.9-25-24.9-65.4 0-90.4l379.3-379.3c0.8-0.9 1.7-1.8 2.5-2.7 25-25 65.4-25 90.4 0l381.3 381.3c25 25 25 65.4 0 90.4s-65.4 25-90.4 0l-336-336z"
      fill="#2c2c2c"
      p-id="1500"
    ></path>
  </svg>
);

const DoubleDownIcon = () => (
  <svg
    t="1626400092729"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="1666"
    width="200"
    height="200"
  >
    <path
      d="M511.2 802.6L174.5 465.9c-25-25-65.4-25-90.4 0-24.9 25-24.9 65.4 0 90.4l379.3 379.3c0.8 0.9 1.7 1.8 2.5 2.7 25 25 65.4 25 90.4 0L937.6 557c25-25 25-65.4 0-90.4s-65.4-25-90.4 0l-336 336z"
      fill="#2c2c2c"
      p-id="1667"
    ></path>
    <path
      d="M511.5 420.6L174.8 83.9c-25-25-65.4-25-90.4 0-24.9 25-24.9 65.4 0 90.4l379.3 379.3c0.8 0.9 1.7 1.8 2.5 2.7 25 25 65.4 25 90.4 0L937.9 175c25-25 25-65.4 0-90.4s-65.4-25-90.4 0l-336 336z"
      fill="#2c2c2c"
      p-id="1668"
    ></path>
  </svg>
);

const SettingsIcon = () => (
  <svg
    t="1626402599435"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="9366"
    width="200"
    height="200"
  >
    <path
      d="M874.666667 156.608a128.042667 128.042667 0 0 1 0 241.450667V917.333333a42.666667 42.666667 0 1 1-85.333334 0V398.058667A128.042667 128.042667 0 0 1 789.333333 156.586667V106.666667a42.666667 42.666667 0 1 1 85.333334 0v49.941333zM832 320a42.666667 42.666667 0 1 0 0-85.333333 42.666667 42.666667 0 0 0 0 85.333333z m-597.333333 71.274667a128.042667 128.042667 0 0 1 0 241.450666V917.333333a42.666667 42.666667 0 1 1-85.333334 0V632.725333A128.042667 128.042667 0 0 1 149.333333 391.253333V106.666667a42.666667 42.666667 0 1 1 85.333334 0v284.608zM192 554.666667a42.666667 42.666667 0 1 0 0-85.333334 42.666667 42.666667 0 0 0 0 85.333334zM554.666667 106.666667v519.274666a128.042667 128.042667 0 0 1 0 241.450667V917.333333a42.666667 42.666667 0 1 1-85.333334 0v-49.941333a128.042667 128.042667 0 0 1 0-241.450667V106.666667a42.666667 42.666667 0 1 1 85.333334 0z m-42.666667 682.666666a42.666667 42.666667 0 1 0 0-85.333333 42.666667 42.666667 0 0 0 0 85.333333z"
      p-id="9367"
      fill="currentColor"
    ></path>
  </svg>
);
