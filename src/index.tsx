import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
ReactGA.initialize(process.env.REACT_APP_GA_TRACKINGID as any, {
  // debug: process.env.NODE_ENV === "development"
});
ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(undefined);
