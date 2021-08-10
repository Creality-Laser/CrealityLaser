import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import App from './containers/App';
import '../utils/i18n';
import reducer from './flux';
import { machineStore } from './store/local-storage';
import { controller, screenController } from './lib/controller';
import user from './lib/user';

const userLogin = async () => {
  const token = machineStore.get('session.token');
  user
    .signin({ token })
    .then(({ authenticated }) => {
      if (authenticated) {
        controller.connect(() => {
          // log.debug('connected controller websocket');
        });
        screenController.connect(() => {
          // log.debug('connected screenController websocket');
        });
      }
    })
    .catch((err) => {
      console.error(`user login error: ${err}`);
    });
};

const runRender = () => {
  const reduxStore = createStore(reducer, applyMiddleware(thunk));

  render(
    <Provider store={reduxStore}>
      <Router>
        <Route path="/" component={App} />
      </Router>
    </Provider>,
    document.getElementById('root')
  );
};

const preventBrowserDropdown = () => {
  // Prevent browser from loading a drag-and-dropped file
  // http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
  window.addEventListener(
    'dragover',
    (e) => {
      e = e || window.event;
      e.preventDefault();
    },
    false
  );
  window.addEventListener(
    'drop',
    (e) => {
      e = e || window.event;
      e.preventDefault();
    },
    false
  );
};

const init = async () => {
  await userLogin();
  preventBrowserDropdown();
  runRender();

  window.addEventListener('error', (e) => {
    console.log(e, '========== window error ==========');
  });

  window.addEventListener('load', () => {
    document.body.style.overflow = 'hidden';
  });
};

init().catch(console.error);

// Hide loading
//   const loading = document.getElementById('loading');
//   loading && loading.remove();
