import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Popover } from 'antd';
import { HEAD_TYPE_3DP } from '../../../../../constants';

const i18n = {
  _: (str) => str,
};

class OperatorGroup extends PureComponent {
  state = {
    goToWorkOriginModalVisible: false,
  };

  render() {
    const {
      canClick,
      executeGcodeAutoHome,
      runBoundary,
      move,
      executeGcode,
      headType,
    } = this.props;

    const { goToWorkOriginModalVisible } = this.state;

    // fmd  不能设置工作原点
    const isCurrentWith3DPHead =
      headType && (headType === HEAD_TYPE_3DP || headType === '3dp');

    return (
      <>
        <Button
          style={{ marginTop: '12px' }}
          block
          size="small"
          type="primary"
          disabled={!canClick}
          onClick={executeGcodeAutoHome}
        >
          {i18n._('Home')}
        </Button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
          }}
        >
          <Popover
            title={i18n._('Set Work Origin')}
            placement="leftTop"
            content={i18n._(
              'Set the current position of the head as the work origin.'
            )}
          >
            <Button
              size="small"
              style={{ width: '140px' }}
              disabled={!canClick || isCurrentWith3DPHead}
              onClick={() => executeGcode('G92 X0 Y0 Z0;\nM500;')}
            >
              {i18n._('Set Work Origin')}
            </Button>
          </Popover>
          <Popover
            title={i18n._('Run Boundary')}
            placement="leftTop"
            content={
              <div style={{ maxWidth: '260px' }}>
                <p>
                  {i18n._(
                    'Click to check the boundary of the image to be engraved.'
                  )}
                </p>
                {/* <br /> */}
                <p>
                  {i18n._(
                    `Note: If you are using the CNC Carving Module, make sure the carving bit will not \
    run into the fixtures before you use this feature.`
                  )}
                </p>
              </div>
            }
          >
            <Button
              size="small"
              style={{ width: '140px' }}
              disabled={!canClick || isCurrentWith3DPHead}
              onClick={runBoundary}
            >
              {i18n._('Run Boundary')}
            </Button>
          </Popover>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '10px',
          }}
        >
          <Popover
            title={i18n._('Go To Work Origin')}
            placement="leftTop"
            content={i18n._('Move the head to the last saved work origin.')}
          >
            <Button
              size="small"
              style={{ width: '140px' }}
              disabled={!canClick || isCurrentWith3DPHead}
              onClick={() =>
                this.setState({ goToWorkOriginModalVisible: true })
              }
            >
              {i18n._('Go To Work Origin')}
            </Button>
          </Popover>
          <Popover
            title={i18n._('Remove Work Origin')}
            placement="leftTop"
            content={i18n._(
              'Remove the current position of the head as the work origin.'
            )}
          >
            <Button
              size="small"
              style={{ width: '140px' }}
              disabled={!canClick || isCurrentWith3DPHead}
              onClick={() => executeGcode('G92.1;\nM500;')}
            >
              {i18n._('Remove Work Origin')}
            </Button>
          </Popover>
        </div>
        {/* <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '10px',
          }}
        >
          <Popover
            title={i18n._('Return to Saved Position')}
            content={i18n._('Return to Saved Position in Machine.')}
          >
            <Button
              size="small"
              style={{ width: '140px' }}
              disabled={!canClick}
              onClick={() => {
                executeGcode('G61 XYZ S0');
              }}
            >
              {i18n._('Return to Saved Position')}
            </Button>
          </Popover>
          <Popover
            title={i18n._('Save Current Position')}
            content={i18n._('Save Current Location in Machine.')}
          >
            <Button
              size="small"
              style={{ width: '140px' }}
              disabled={!canClick}
              onClick={() => executeGcode('G60 S0')}
            >
              {i18n._('Save Current Location')}
            </Button>
          </Popover>
        </div> */}
        <Modal
          visible={goToWorkOriginModalVisible}
          onCancel={() => this.setState({ goToWorkOriginModalVisible: false })}
          title={
            <span style={{ fontWeight: '500' }}>
              {i18n._('Go To Work Origin Confirm')}
            </span>
          }
          zIndex={1100}
          modalContentWidth="460px"
          minHeight="178px"
        >
          <hr />
          <div style={{ padding: '0 20px 20px' }}>
            {i18n._(
              'Please make sure that you already set work origin for current material, otherwise, there might be a risk of collision.'
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '20px',
            }}
          >
            <Button
              onClick={() =>
                this.setState({ goToWorkOriginModalVisible: false })
              }
              style={{
                height: '30px',
                width: '80px',
                marginRight: '20px',
              }}
            >
              {i18n._('Cancel')}
            </Button>
            <Button
              type="primary"
              style={{ height: '30px', width: '80px' }}
              onClick={() => {
                this.setState({ goToWorkOriginModalVisible: false });
                move({ x: 0, y: 0, z: 0 });
              }}
            >
              {i18n._('Ok')}
            </Button>
          </div>
        </Modal>
      </>
    );
  }
}

OperatorGroup.propTypes = {
  canClick: PropTypes.bool,
  executeGcodeAutoHome: PropTypes.func,
  runBoundary: PropTypes.func,
  move: PropTypes.func,
  executeGcode: PropTypes.func,
  headType: PropTypes.string,
};

export default OperatorGroup;
