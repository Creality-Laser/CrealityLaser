import { combineReducers } from 'redux';
import laser from './laser';
import editor from './editor';
import widget from './widget';
import text from './text';
import keyboardShortcut from './keyboardShortcut';
import workspace from './workspace';
import machine from './machine';

export default combineReducers({
  laser,
  editor,
  widget,
  keyboardShortcut,
  text,
  workspace,
  machine,
});
