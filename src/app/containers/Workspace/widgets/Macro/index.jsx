import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ensureArray from 'ensure-array';
import classNames from 'classnames';
import { Button, Modal } from 'antd';
import { PlayCircleFilled, EditOutlined } from '@ant-design/icons';

import { createDefaultWidget } from '../../../../components/SMWidget';
import api from '../../../../api';
import { actions as machineActions } from '../../../../flux/machine';
// import { actions as developToolsActions } from '../../../../flux/develop-tools';
import styles from './index.module.scss';

import {
  MODAL_RUN_MACRO,
  MODAL_NONE,
  MODAL_ADD_MACRO,
  MODAL_EDIT_MACRO,
  // PROTOCOL_SCREEN,
  WORKFLOW_STATE_IDLE,
} from '../../../../constants';

const i18n = {
  _: (str) => str,
};

const STATUS_IDLE = 'idle';

class Macro extends PureComponent {
  state = {
    modalName: MODAL_NONE,
    modalParams: {},
    macros: [],
    newMacroFields: {
      name: '',
      content: '',
      repeat: 1,
    },
    isDelMacroModalVisible: false,
  };

  actions = {
    initNewMacroFields: () => {
      this.setState({
        newMacroFields: {
          name: '',
          content: '',
          repeat: 1,
        },
      });
    },
    openModal: (name = MODAL_NONE, params = {}) => {
      this.setState({
        modalName: name,
        modalParams: params,
      });
    },
    closeModal: () => {
      this.setState({
        modalName: MODAL_NONE,
        modalParams: {},
        newMacroFields: {
          name: '',
          content: '',
          repeat: 1,
        },
      });
    },
    updateModal: (modal) => {
      this.setState((state) => ({
        ...state.modal,
        modalName: modal.name,
        modalParams: modal.params,
      }));
    },
    addMacro: async ({ name, content, repeat }) => {
      try {
        await api.macros.create({ name, content, repeat });
        const res = await api.macros.fetch();
        const { records: macros } = res.body;
        await this.setState({ macros });
      } catch (err) {
        // Ignore error
      }
    },
    deleteMacro: async (id) => {
      try {
        let res;
        res = await api.macros.delete(id);
        res = await api.macros.fetch();
        const { records: macros } = res.body;
        this.setState({ macros });
      } catch (err) {
        // Ignore error
      }
    },
    updateMacro: async (id, { name, content, repeat }) => {
      try {
        let res;
        res = await api.macros.update(id, { name, content, repeat });
        res = await api.macros.fetch();
        const { records: macros } = res.body;
        this.setState({ macros });
      } catch (err) {
        // Ignore error
      }
    },
    openAddMacroModal: () => {
      this.actions.openModal(MODAL_ADD_MACRO);
    },
    executeGcode: (gcode) => {
      gcode = gcode.trim();
      // if (this.props.dataSource === PROTOCOL_SCREEN) {
      //   this.props.developToolsExecuteGcode(gcode);
      // } else {
      this.props.executeGcode(gcode);
      // }
    },
    runMacro: (macro) => {
      api.macros.read(macro.id).then((res) => {
        const { id, name, content, repeat } = res.body;
        const modal = {
          name: MODAL_RUN_MACRO,
          params: { id, name, content, repeat },
        };
        this.actions.updateModal(modal);
      });
      let gcode = '';
      for (let i = 0; i < macro.repeat; i++) {
        gcode = gcode.concat(macro.content, '\n');
      }
      this.actions.executeGcode(gcode);
    },
    openEditMacroModal: (id) => {
      api.macros.read(id).then((res) => {
        const { name, content, repeat } = res.body;
        this.actions.openModal(MODAL_EDIT_MACRO, {
          id: res.body.id,
          name,
          content,
          repeat,
        });
      });
    },
    canClick: () => {
      const { workflowState, workflowStatus, isConnected } = this.props;
      if (!isConnected) {
        return false;
      }

      if (
        workflowState !== WORKFLOW_STATE_IDLE &&
        workflowStatus !== STATUS_IDLE
      ) {
        return false;
      }
      return true;
    },
  };

  constructor(props) {
    super(props);
    this.props.setTitle('Macro');
  }

  componentDidMount() {
    this.fetchMacros();
  }

  fetchMacros = async () => {
    try {
      const res = await api.macros.fetch();
      const { records: macros } = res.body;
      this.setState({ macros });
    } catch (err) {
      // Ignore error
    }
  };

  render() {
    const { isDisabled = false } = this.props;
    const {
      macros,
      modalName,
      modalParams,
      newMacroFields,
      isDelMacroModalVisible,
    } = this.state;

    const canClick = this.actions.canClick();

    return (
      <>
        <div className={styles.contentWrapper}>
          {macros.length === 0 && (
            <div className={styles.noMacroWrapper}>{i18n._('No macros')}</div>
          )}
          {macros.length > 0 && (
            <div className={styles.macroListWrapper}>
              {ensureArray(macros).map((macro) => (
                <div key={macro.id} className={styles.macroListItem}>
                  <button
                    className={styles.macroListItemRunBtn}
                    type="button"
                    title={i18n._('Run Macro')}
                    disabled={!canClick}
                    onClick={() => {
                      this.actions.runMacro(macro);
                    }}
                  >
                    <PlayCircleFilled />
                  </button>
                  <span className={styles.macroListItemName} title={macro.name}>
                    {macro.name}
                  </span>
                  <button
                    className={styles.macroListItemEditBtn}
                    type="button"
                    onClick={() => {
                      this.actions.openEditMacroModal(macro.id);
                    }}
                  >
                    <EditOutlined />
                  </button>
                </div>
              ))}
            </div>
          )}
          <hr className={styles.divider} />
          <Button
            type="primary"
            size="small"
            block
            onClick={() => this.actions.openModal(MODAL_ADD_MACRO, {})}
            disabled={isDisabled}
          >
            New Macro
          </Button>
        </div>
        <Modal
          visible={modalName === MODAL_ADD_MACRO}
          onCancel={this.actions.closeModal}
          zIndex={1060}
          title={i18n._('New Macro')}
          modalContentWidth="460px"
          onOk={() => {
            this.actions.addMacro(newMacroFields).then(() => {
              this.actions.initNewMacroFields();
              this.actions.closeModal();
            });
          }}
          okButtonProps={{
            disabled:
              !newMacroFields.name ||
              !newMacroFields.content ||
              !newMacroFields.repeat ||
              newMacroFields.repeat < 0,
          }}
        >
          <div>
            <div className={styles.modalNewContentWrapper}>
              <div className={styles.modalNewContentInputLabel}>Macro Name</div>
              <input
                className={styles.modalNewContentInput}
                value={newMacroFields.name}
                onChange={(e) => {
                  const val = e.target.value;
                  this.setState({
                    newMacroFields: { ...newMacroFields, name: val },
                  });
                }}
              />
              <div className={styles.modalNewContentInputLabel}>
                Macro Commands
              </div>
              <textarea
                className={styles.modalNewContentTextarea}
                value={newMacroFields.content}
                onChange={(e) => {
                  const val = e.target.value;
                  this.setState({
                    newMacroFields: { ...newMacroFields, content: val },
                  });
                }}
              />
              <div className={styles.modalNewContentInputLabel}>Repeat</div>
              <input
                type="number"
                className={styles.modalNewContentInput}
                style={{ width: '60px' }}
                value={newMacroFields.repeat}
                onChange={(e) => {
                  const val = e.target.value;
                  this.setState({
                    newMacroFields: { ...newMacroFields, repeat: val },
                  });
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (
                      newMacroFields.name &&
                      newMacroFields.content &&
                      newMacroFields.repeat &&
                      newMacroFields.repeat >= 0
                    ) {
                      this.actions.addMacro(newMacroFields).then(() => {
                        this.actions.initNewMacroFields();
                        this.actions.closeModal();
                      });
                    }
                  }
                }}
              />
            </div>
          </div>
        </Modal>
        <Modal
          visible={modalName === MODAL_EDIT_MACRO}
          onCancel={this.actions.closeModal}
          zIndex={1060}
          title={i18n._('Edit Macro')}
          modalContentWidth="460px"
          footer={null}
        >
          <div>
            <div className={styles.modalNewContentWrapper}>
              <div className={styles.modalNewContentInputLabel}>Macro Name</div>
              <input
                className={styles.modalNewContentInput}
                value={modalParams.name ? modalParams.name : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  this.setState({
                    modalParams: { ...modalParams, name: val },
                  });
                }}
              />
              <div className={styles.modalNewContentInputLabel}>
                Macro Commands
              </div>
              <textarea
                className={styles.modalNewContentTextarea}
                value={modalParams.content ? modalParams.content : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  this.setState({
                    modalParams: { ...modalParams, content: val },
                  });
                }}
              />
              <div className={styles.modalNewContentInputLabel}>Repeat</div>
              <input
                type="number"
                className={styles.modalNewContentInput}
                style={{ width: '60px' }}
                value={modalParams.repeat ? modalParams.repeat : 1}
                onChange={(e) => {
                  const val = e.target.value;
                  this.setState({
                    modalParams: { ...modalParams, repeat: val },
                  });
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (
                      modalParams.name &&
                      modalParams.content &&
                      modalParams.repeat &&
                      modalParams.repeat >= 0
                    ) {
                      this.actions
                        .updateMacro(modalParams.id, {
                          name: modalParams.name,
                          content: modalParams.content,
                          repeat: modalParams.repeat,
                        })
                        .then(() => {
                          this.actions.closeModal();
                        });
                    }
                  }
                }}
              />
            </div>
            <hr className={styles.modalNewDivider} />
            <div className={styles.modalEditContentOperatorRow}>
              <span className={styles.modalEditContentOperatorRowLeft}>
                <Button
                  type="danger-linear"
                  style={{ width: '80px', height: '30px' }}
                  onClick={() =>
                    this.setState({ isDelMacroModalVisible: true })
                  }
                >
                  {i18n._('Delete')}
                </Button>
              </span>
              <span className={styles.modalEditContentOperatorRowRight}>
                <Button
                  onClick={this.actions.closeModal}
                  style={{
                    width: '80px',
                    height: '30px',
                    marginRight: '30px',
                  }}
                >
                  {i18n._('Cancel')}
                </Button>
                <Button
                  onClick={() => {
                    this.actions
                      .updateMacro(modalParams.id, {
                        name: modalParams.name,
                        content: modalParams.content,
                        repeat: modalParams.repeat,
                      })
                      .then(() => {
                        this.actions.closeModal();
                      });
                  }}
                  type="primary"
                  style={{ width: '80px', height: '30px' }}
                  disabled={
                    !modalParams.name ||
                    !modalParams.content ||
                    !modalParams.repeat ||
                    modalParams.repeat < 0
                  }
                >
                  {i18n._('OK')}
                </Button>
              </span>
            </div>
          </div>
        </Modal>
        <Modal
          visible={isDelMacroModalVisible}
          onCancel={() => this.setState({ isDelMacroModalVisible: false })}
          zIndex={1100}
          title={i18n._('Delete Macro')}
          modalContentWidth="460px"
          minHeight="178px"
          footer={null}
        >
          <div>
            <div className={styles.modalDelMacroContentWrapper}>
              <span
                className={classNames(
                  'iconfont',
                  styles.modalDelMacroContentIcon
                )}
              >
                &#xe6b3;
              </span>
              <span className={styles.modalDelMacroContent}>
                {i18n._('Delete this macro?')}
                <span>
                  <strong>{modalParams.name}</strong>
                </span>
              </span>
            </div>
            <div className={styles.modalDelMacroOperaterRow}>
              <Button
                onClick={() => this.setState({ isDelMacroModalVisible: false })}
                style={{
                  height: '30px',
                  width: '80px',
                  marginRight: '30px',
                }}
              >
                {i18n._('No')}
              </Button>
              <Button
                type="primary"
                style={{ height: '30px', width: '80px' }}
                onClick={() => {
                  this.actions.deleteMacro(modalParams.id);
                  this.setState({ isDelMacroModalVisible: false }, () => {
                    this.actions.closeModal();
                  });
                }}
              >
                {i18n._('Yes')}
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

Macro.propTypes = {
  setTitle: PropTypes.func,
  // dataSource: PropTypes.string.isRequired,

  // redux
  isConnected: PropTypes.bool.isRequired,
  workflowState: PropTypes.string.isRequired,
  workflowStatus: PropTypes.string.isRequired,
  executeGcode: PropTypes.func.isRequired,
  // developToolsExecuteGcode: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};

const mapStateToProps = (state) => {
  const { workflowState, workflowStatus, isConnected } = state.machine;
  const { dataSource } = state.widget.widgets.macro;

  return {
    isConnected,
    workflowState,
    workflowStatus,
    dataSource,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    executeGcode: (gcode) => dispatch(machineActions.executeGcode(gcode)),
    // developToolsExecuteGcode: (gcode) =>
    // dispatch(developToolsActions.executeGcode(gcode)),
  };
};

export default createDefaultWidget(
  connect(mapStateToProps, mapDispatchToProps)(Macro)
);
