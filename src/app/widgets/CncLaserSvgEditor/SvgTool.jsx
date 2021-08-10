import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import { Button } from 'antd';
import styles from './index.module.scss';
import { library } from './lib/ext-shapes';

class SvgTool extends PureComponent {
  state = {
    showExtShape: false,
    extShape: null,
    showTools: false,
  };

  actions = {
    onClickInsertText: () => {
      this.props.insertDefaultTextVector();
    },

    setMode: (mode, ext) => {
      this.setState({
        showExtShape: false,
        extShape: ext,
      });
      this.props.setMode(mode, ext);
    },

    showExt: () => {
      this.setState((state) => {
        return {
          showExtShape: !state.showExtShape,
        };
      });
    },
  };

  render() {
    const { mode } = this.props;
    const { showExtShape, extShape, showTools } = this.state;
    return (
      <>
        <div className={classNames(styles['visualizer-center'])}>
          <div className={styles['center-tool']}>
            <Button
              size="small"
              className={classNames(styles['btn-center'])}
              onClick={() =>
                this.setState((prev) => ({ showTools: !prev.showTools }))
              }
            >
              <ToolsIcon />
            </Button>
            {showTools && (
              <>
                <Button
                  type="primary"
                  size="small"
                  className={classNames(styles['btn-center'], {
                    [styles.selected]: mode === 'select',
                  })}
                  onClick={() => this.actions.setMode('select')}
                >
                  <CursorIcon />
                </Button>
                <Button
                  type="primary"
                  className={classNames(styles['btn-center'], {
                    [styles.selected]: mode === 'rect',
                  })}
                  onClick={() => this.actions.setMode('rect')}
                >
                  <RectIcon />
                </Button>
                <Button
                  type="primary"
                  className={classNames(styles['btn-center'], {
                    [styles.selected]: mode === 'ellipse',
                  })}
                  onClick={() => this.actions.setMode('ellipse')}
                >
                  <EllipseIcon />
                </Button>
                <Button
                  type="primary"
                  className={styles['btn-center']}
                  onClick={this.actions.onClickInsertText}
                >
                  <TextIcon />
                </Button>
              </>
            )}
            {false && (
              <Button
                type="primary"
                className={classNames(styles['btn-center'], {
                  [styles.selected]: mode === 'ext',
                })}
                onClick={() => this.actions.showExt()}
              >
                <i
                  className={
                    styles[
                      mode === 'ext' && extShape ? `btn-${extShape}` : 'btn-ext'
                    ]
                  }
                />
              </Button>
            )}
          </div>
          {false && showExtShape && (
            <div className={classNames(styles['center-ext'])}>
              {_.map(library.use, (key) => {
                return (
                  <Button
                    key={key}
                    type="primary"
                    className={styles['btn-center-ext']}
                    onClick={() => this.actions.setMode('ext', key)}
                  >
                    <i className={styles[`btn-ext-${key}`]} />
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }
}

SvgTool.propTypes = {
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  insertDefaultTextVector: PropTypes.func.isRequired,
};

// const mapStateToProps = (state) => {
//     return {
//
//     };
// };
//
// const mapDispatchToProps = (dispatch) => ({
//     insertDefaultTextVector: () => dispatch(editorActions.insertDefaultTextVector('laser'))
// });

export default SvgTool;

const ToolsIcon = () => (
  <svg
    t="1626766417927"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="20633"
    width="200"
    height="200"
  >
    <path
      d="M298.666667 938.666667H128c-25.6 0-42.666667-17.066667-42.666667-42.666667v-170.666667c0-12.8 4.266667-21.333333 12.8-29.866666l554.666667-554.666667c64-64 166.4-64 230.4 0s64 166.4 0 230.4l-554.666667 554.666667c-8.533333 8.533333-17.066667 12.8-29.866666 12.8z m-128-85.333334h110.933333L823.466667 311.466667c29.866667-29.866667 29.866667-81.066667 0-110.933334s-81.066667-29.866667-110.933334 0L170.666667 742.4V853.333333z"
      p-id="20634"
      fill="currentColor"
    ></path>
    <path
      d="M789.333333 448c-12.8 0-21.333333-4.266667-29.866666-12.8l-170.666667-170.666667c-17.066667-17.066667-17.066667-42.666667 0-59.733333s42.666667-17.066667 59.733333 0l170.666667 170.666667c17.066667 17.066667 17.066667 42.666667 0 59.733333-8.533333 8.533333-17.066667 12.8-29.866667 12.8zM341.333333 554.666667c-12.8 0-21.333333-4.266667-29.866666-12.8l-213.333334-213.333334c-17.066667-17.066667-17.066667-42.666667 0-59.733333l170.666667-170.666667c17.066667-17.066667 42.666667-17.066667 59.733333 0l213.333334 213.333334c17.066667 17.066667 17.066667 42.666667 0 59.733333s-42.666667 17.066667-59.733334 0L298.666667 187.733333 187.733333 298.666667l183.466667 183.466666c17.066667 17.066667 17.066667 42.666667 0 59.733334-8.533333 8.533333-17.066667 12.8-29.866667 12.8z"
      p-id="20635"
      fill="currentColor"
    ></path>
    <path
      d="M234.666667 448c-12.8 0-21.333333-4.266667-29.866667-12.8-17.066667-17.066667-17.066667-42.666667 0-59.733333l64-64c17.066667-17.066667 42.666667-17.066667 59.733333 0s17.066667 42.666667 0 59.733333l-64 64c-8.533333 8.533333-17.066667 12.8-29.866666 12.8zM725.333333 938.666667c-12.8 0-21.333333-4.266667-29.866666-12.8l-213.333334-213.333334c-17.066667-17.066667-17.066667-42.666667 0-59.733333s42.666667-17.066667 59.733334 0l183.466666 183.466667 110.933334-110.933334-183.466667-183.466666c-17.066667-17.066667-17.066667-42.666667 0-59.733334s42.666667-17.066667 59.733333 0l213.333334 213.333334c17.066667 17.066667 17.066667 42.666667 0 59.733333l-170.666667 170.666667c-8.533333 8.533333-17.066667 12.8-29.866667 12.8z"
      p-id="20636"
      fill="currentColor"
    ></path>
    <path
      d="M618.666667 832c-12.8 0-21.333333-4.266667-29.866667-12.8-17.066667-17.066667-17.066667-42.666667 0-59.733333l64-64c17.066667-17.066667 42.666667-17.066667 59.733333 0s17.066667 42.666667 0 59.733333l-64 64c-8.533333 8.533333-17.066667 12.8-29.866666 12.8z"
      p-id="20637"
      fill="currentColor"
    ></path>
  </svg>
);

const TextIcon = () => (
  <svg
    t="1626765858637"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="19708"
    width="200"
    height="200"
  >
    <path
      d="M917.333 73.387h-24.32a55.893 55.893 0 0 1-55.04 34.133H186.027a55.893 55.893 0 0 1-55.04-34.133h-24.32L90.453 332.8h23.467c56.747-198.827 86.613-180.053 349.44-182.613v600.32c-3.84 186.453-31.573 170.666-157.867 179.2v20.906h413.014v-20.906c-128-10.24-154.027 7.253-157.867-179.2v-600.32c262.827 2.56 292.267-16.214 349.44 182.613h23.467z"
      fill="currentColor"
      p-id="19709"
    ></path>
  </svg>
);

const EllipseIcon = () => (
  <svg
    t="1626765511568"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="15504"
    width="200"
    height="200"
  >
    <path
      d="M512 170.666667c260.266667 0 469.333333 153.6 469.333333 341.333333s-209.066667 341.333333-469.333333 341.333333-469.333333-153.6-469.333333-341.333333 209.066667-341.333333 469.333333-341.333333z m0 76.8c-221.866667 0-392.533333 123.733333-392.533333 264.533333s170.666667 264.533333 392.533333 264.533333 392.533333-123.733333 392.533333-264.533333-170.666667-264.533333-392.533333-264.533333z"
      p-id="15505"
      fill="currentColor"
    ></path>
  </svg>
);

const RectIcon = () => (
  <svg
    t="1626765278605"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="11537"
    width="200"
    height="200"
  >
    <path
      d="M853.333333 128H170.666667c-47.061333 0-85.333333 38.272-85.333334 85.333333v597.333334c0 47.061333 38.272 85.333333 85.333334 85.333333h682.666666c47.061333 0 85.333333-38.272 85.333334-85.333333V213.333333c0-47.061333-38.272-85.333333-85.333334-85.333333zM170.666667 810.666667V213.333333h682.666666l0.042667 597.333334H170.666667z"
      p-id="11538"
      fill="currentColor"
    ></path>
  </svg>
);

const CursorIcon = () => (
  <svg
    t="1626765721560"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="18668"
    width="200"
    height="200"
  >
    <path
      d="M115.5 116c-10.6 10.6-13.8 26.4-8.3 40.3l282.3 704.4c6 14.9 20.8 24.3 36.9 23.4 16-1 29.7-12.1 33.8-27.6l47-175.4 128.4 128.4c14.6 14.6 38.2 14.6 52.8 0L809 688.9c14.6-14.6 14.6-38.2 0-52.8L680.6 507.7l175.4-47c15.5-4.2 26.6-17.8 27.6-33.8 1-16-8.5-30.9-23.4-36.9L155.8 107.8c-13.9-5.6-29.7-2.4-40.3 8.2z m612.9 301.6l-129.6 34.7c-12.9 3.5-22.9 13.5-26.4 26.4-3.5 12.9 0.2 26.6 9.7 36l147.7 147.7-67.8 67.9-147.7-147.7c-9.4-9.4-23.2-13.1-36-9.7-12.9 3.5-22.9 13.5-26.4 26.4l-34.7 129.6L209 209.5l519.4 208.1z"
      p-id="18669"
      fill="currentColor"
    ></path>
  </svg>
);
