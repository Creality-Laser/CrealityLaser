import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { MACHINE_SERIES } from '../../../constants';
import { actions as machineActions } from '../../../flux/machine';
import styles from './index.module.scss';

const { Option } = Select;

const machines = Object.values(MACHINE_SERIES)
  .map((machine) => machine && machine.value)
  .filter((m) => m.startsWith('CV'));

function MachineSelection(props) {
  const { series, updateMachineSeries, machine } = props;

  console.log(machine, '----------- machine ---------');

  const { t } = useTranslation();

  return (
    <section className={styles.machine_selection_wrapper}>
      <span className={styles.machine_selection_label}>
        {t('choose_machine', 'Choose Machine')}
        <span>: </span>
      </span>
      <Select
        value={series}
        style={{ width: 120 }}
        onChange={updateMachineSeries}
      >
        {machines.map((machine) => (
          <Option value={machine} key={machine}>
            {machine}
          </Option>
        ))}
      </Select>
    </section>
  );
}

MachineSelection.propTypes = {
  machine: PropTypes.object,
  series: PropTypes.string.isRequired,
  updateMachineSeries: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const {
    machine: { series },
  } = state;

  return { series, machine: state.machine };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateMachineSeries: (series) =>
      dispatch(machineActions.updateMachineSeries(series)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MachineSelection);
