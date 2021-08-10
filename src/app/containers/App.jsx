import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import useListenLanguageChangeAndChangeLanguage from '../hooks/useListenLanguageChangeAndChangeLanguage';
import { actions as laserActions } from '../flux/laser';
import { actions as editorActions } from '../flux/editor';
import { actions as textActions } from '../flux/text';
import { actions as workspaceActions } from '../flux/workspace';
import { actions as keyboardShortcutActions } from '../flux/keyboardShortcut';
import Header from './Header/index';
import Laser from './Laser';
import Settings from './Settings';
import './App.global.less';

function App(props) {
  useListenLanguageChangeAndChangeLanguage();

  const {
    location,
    laserInit,
    textInit,
    functionsInit,
    initModelsPreviewChecker,
    workspaceInit,
    keyboardShortcutInit,
  } = props;

  const isAllowedRouterPath = isRouterPathAllowed(location.pathname);

  useEffect(() => {
    keyboardShortcutInit();
    laserInit();
    textInit();
    functionsInit();
    initModelsPreviewChecker();
    workspaceInit();
  }, [
    functionsInit,
    initModelsPreviewChecker,
    laserInit,
    textInit,
    workspaceInit,
    keyboardShortcutInit,
  ]);

  useEffect(() => {
    // disable select text on document
    document.onselectstart = () => {
      return false;
    };
  }, []);

  if (!isAllowedRouterPath) {
    return (
      <Redirect
        to={{
          pathname: '/laser',
          state: {
            from: location,
          },
        }}
      />
    );
  }

  return (
    <>
      <Header />
      {/* <Switch>
        <Route exact path="/" component={Laser} />
        <Route path="/laser" component={Laser} />
        <Route path="/settings" component={Settings} />
        <Route>
          <div>Oops! No match here...</div>
        </Route>
      </Switch> */}
      <Laser
        style={{
          display: location.pathname !== '/laser' ? 'none' : '',
        }}
      />
      {location.pathname.indexOf('/settings') === 0 && <Settings />}
    </>
  );
}

App.propTypes = {
  // match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  // history: PropTypes.object.isRequired,
  laserInit: PropTypes.func.isRequired,
  textInit: PropTypes.func.isRequired,
  functionsInit: PropTypes.func.isRequired,
  initModelsPreviewChecker: PropTypes.func.isRequired,
  workspaceInit: PropTypes.func.isRequired,
  keyboardShortcutInit: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return state;
};

const mapDispatchToProps = (dispatch) => {
  return {
    laserInit: () => dispatch(laserActions.init()),
    textInit: () => dispatch(textActions.init()),
    functionsInit: () => {
      dispatch(editorActions.initSelectedModelListener('laser'));
    },
    keyboardShortcutInit: () => dispatch(keyboardShortcutActions.init()),
    initModelsPreviewChecker: () => {
      dispatch(editorActions.initModelsPreviewChecker('laser'));
    },
    workspaceInit: () => dispatch(workspaceActions.init()),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));

function isRouterPathAllowed(pathname) {
  const allowedPaths = [
    '/laser',
    '/settings',
    '/developTools',
    '/caselibrary',
    '/settings/general',
    '/settings/machine',
    '/settings/config',
  ];
  return allowedPaths.includes(pathname);
}
