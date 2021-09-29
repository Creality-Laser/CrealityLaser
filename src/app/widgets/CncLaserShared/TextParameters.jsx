import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Input, Button } from 'antd';
import { withTranslation } from 'react-i18next';

import ParametersHead from '../components/params/ParametersHead';
import ParameterItem, {
  ParameterItemLabel,
  ParameterItemValue,
} from '../components/params/ParameterItem';
import StyledSelect, { Option } from '../components/params/StyledSelect';
import StyledInputNumber from '../components/params/StyledInputNumber';

import { actions as textActions } from '../../flux/text';

const AddIcon = () => (
  <svg
    t="1626763198922"
    className="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="7393"
    width="200"
    height="200"
  >
    <path
      d="M896 448H576V128c0-35.2-28.8-64-64-64s-64 28.8-64 64v320H128c-35.2 0-64 28.8-64 64s28.8 64 64 64h320v320c0 35.2 28.8 64 64 64s64-28.8 64-64V576h320c35.2 0 64-28.8 64-64s-28.8-64-64-64z"
      fill="#2c2c2c"
      p-id="7394"
    ></path>
  </svg>
);
const { TextArea } = Input;
class TextParameters extends PureComponent {
  state = {
    expanded: true,
  };

  fileInput = React.createRef();

  actions = {
    onToggleExpand: () => {
      this.setState((state) => ({ expanded: !state.expanded }));
    },
    onClickUpload: () => {
      this.fileInput.current.value = null;
      this.fileInput.current.click();
    },
    onChangeFile: (event) => {
      const file = event.target.files[0];
      this.props.uploadFont(file);
    },
    onChangeText: (event) => {
      const text = event.target.value;
      this.props.updateSelectedModelTextConfig({ text });
    },
    onChangeFont: (option) => {
      if (option.value === 'AddFonts') {
        this.actions.onClickUpload();
        return;
      }
      const font = option.value;
      this.props.updateSelectedModelTextConfig({ font });
    },
    onChangeSize: (size) => {
      this.props.updateSelectedModelTextConfig({ size });
    },
    onChangeLineHeight: (option) => {
      const lineHeight = option.value;
      this.props.updateSelectedModelTextConfig({ lineHeight });
    },
    onChangeAlignment: (value) => {
      const alignment = value;
      this.props.updateSelectedModelTextConfig({ alignment });
    },
  };

  render() {
    const { config, fontOptions, disabled, t } = this.props;
    const { text, size, font, lineHeight, alignment } = config;
    const actions = this.actions;

    return (
      <div>
        <ParametersHead
          title={t('Text')}
          expanded={this.state.expanded}
          onToggleExpand={this.actions.onToggleExpand}
        />
        {this.state.expanded && (
          <>
            <ParameterItem
              popover={{
                title: t('Text'),
                content: t(
                  `Enter the text you want to engrave. The maximum length of the text is 125 mm. When the text is too long, it will be shrunk automatically. Start a new line manually according to your needs.`
                ),
              }}
            >
              <ParameterItemLabel>{t('Text')}</ParameterItemLabel>
              <ParameterItemValue>
                <TextArea
                  disabled={disabled}
                  style={{ width: '202px', resize: 'none' }}
                  rows="3"
                  defaultValue={text}
                  onChange={actions.onChangeText}
                />
              </ParameterItemValue>
            </ParameterItem>
            <ParameterItem
              popover={{
                title: t('Font'),
                content: t(
                  `Select a word font or upload a font from your computer. WOFF, TTF, OTF fonts are supported.`
                ),
              }}
            >
              <ParameterItemLabel>{t('Font')}</ParameterItemLabel>
              <ParameterItemValue>
                <input
                  disabled={disabled}
                  ref={this.fileInput}
                  type="file"
                  accept=".woff, .ttf, .otf"
                  style={{ display: 'none' }}
                  multiple={false}
                  onChange={actions.onChangeFile}
                />
                <StyledSelect
                  disabled={disabled}
                  placeholder={t('Choose font')}
                  value={font}
                  onChange={(value) => actions.onChangeFont({ value })}
                >
                  {fontOptions.map(({ label, value }, index) => (
                    <Option key={value} value={value}>
                      {index === 0 ? (
                        <span>
                          <AddIcon /> {t('Add Font')}
                        </span>
                      ) : (
                        label
                      )}
                    </Option>
                  ))}
                </StyledSelect>
              </ParameterItemValue>
            </ParameterItem>
            <ParameterItem
              popover={{
                title: t('Font Size'),
                content: t('Enter the font size in pt (points).'),
              }}
            >
              <ParameterItemLabel>{t('Font Size')}</ParameterItemLabel>
              <ParameterItemValue>
                <StyledInputNumber
                  disabled={disabled}
                  value={size}
                  onChange={actions.onChangeSize}
                  addonAfter="pt"
                />
              </ParameterItemValue>
            </ParameterItem>
            <ParameterItem
              popover={{
                title: t('Line Height'),
                content: t(
                  `Set the distance between each line in the text. The value you enter is the multiple of the font size.`
                ),
              }}
            >
              <ParameterItemLabel>{t('Line Height')}</ParameterItemLabel>
              <ParameterItemValue>
                <StyledSelect
                  disabled={disabled}
                  options={[
                    { label: '1.0', value: 1 },
                    { label: '1.2', value: 1.2 },
                    { label: '1.5', value: 1.5 },
                    { label: '2.0', value: 2 },
                  ]}
                  value={lineHeight}
                  onChange={(value) => actions.onChangeLineHeight({ value })}
                >
                  <Option value={1}>1.0</Option>
                  <Option value={1.2}>1.2</Option>
                  <Option value={1.5}>1.5</Option>
                  <Option value={2.0}>2.0</Option>
                </StyledSelect>
              </ParameterItemValue>
            </ParameterItem>
            <ParameterItem
              popover={{
                title: t('Alignment'),
                content: t(
                  `Align the text in different lines to either the left or right or in the center horizontally.`
                ),
              }}
            >
              <ParameterItemLabel>{t('Alignment')}</ParameterItemLabel>
              <ParameterItemValue>
                <Button
                  disabled={disabled}
                  onClick={() => {
                    actions.onChangeAlignment('left');
                  }}
                  size="small"
                >
                  {t('left')}
                </Button>
                <Button
                  disabled={disabled}
                  onClick={() => {
                    actions.onChangeAlignment('middle');
                  }}
                  size="small"
                >
                  {t('center')}
                </Button>
                <Button
                  disabled={disabled}
                  onClick={() => {
                    actions.onChangeAlignment('right');
                  }}
                  size="small"
                >
                  {t('right')}
                </Button>
              </ParameterItemValue>
            </ParameterItem>
          </>
        )}
      </div>
    );
  }
}

TextParameters.propTypes = {
  t: PropTypes.func,
  fontOptions: PropTypes.array,
  disabled: PropTypes.bool,
  config: PropTypes.shape({
    text: PropTypes.string,
    size: PropTypes.number,
    font: PropTypes.string,
    lineHeight: PropTypes.number,
    alignment: PropTypes.string,
  }),
  uploadFont: PropTypes.func.isRequired,
  updateSelectedModelTextConfig: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { fonts } = state.text;
  const fontOptions = fonts.map((font) => ({
    label: font.displayName,
    value: font.fontFamily,
  }));
  fontOptions.unshift({
    label: `+ $'Add Fonts'}`,
    value: 'AddFonts',
  });
  return {
    fontOptions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    uploadFont: (file) => dispatch(textActions.uploadFont(file)),
  };
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(TextParameters)
);
