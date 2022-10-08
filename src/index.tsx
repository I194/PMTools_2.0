import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from "react-redux";
import { setupStore } from "./services/store/store";
import App from './components/App/App';
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const store = setupStore();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

