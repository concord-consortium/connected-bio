import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

injectTapEventPlugin();
(window as any).require_brunch = (window as any).require;

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
