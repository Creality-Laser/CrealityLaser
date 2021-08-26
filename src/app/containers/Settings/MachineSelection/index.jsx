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
  .map(
    (machine) =>
      machine && machine.value && { label: machine.label, value: machine.value }
  )
  .filter((m) => m.value.startsWith('CV'));

console.log(machines);

function MachineSelection(props) {
  const { series, updateMachineSeries } = props;

  const { t } = useTranslation();

  return (
    <section className={styles.machine_selection_wrapper}>
      <span className={styles.machine_selection_label}>
        {t('choose_machine', 'Choose Machine')}
        <span>: </span>
      </span>
      <Select
        value={series}
        style={{ width: 160 }}
        onChange={updateMachineSeries}
      >
        {machines.map(({ label, value }) => (
          <Option value={value} key={value}>
            {label}
          </Option>
        ))}
      </Select>
    </section>
  );
}

MachineSelection.propTypes = {
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
