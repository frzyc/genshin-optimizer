import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga4';
import App from './App';
import './index.css';
import NewTab from './NewTab';
import reportWebVitals from './reportWebVitals';
ReactGA.initialize(process.env.REACT_APP_GA_TRACKINGID as any, {
  testMode: process.env.NODE_ENV === "development"
});
let mode: "main" | "newtab" = "main"
let root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);

// Detect a storage event, and unmount the main page to show a newTab event.
function handleStorage(this: Window, event: StorageEvent) {
  if (mode === "newtab") return
  mode = "newtab"
  this.document.title = "ERROR"
  root.unmount()
  root = createRoot(document.getElementById('root') as HTMLElement)
  root.render(<React.StrictMode><NewTab /></React.StrictMode>);
}
window.addEventListener("storage", handleStorage)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(undefined);
