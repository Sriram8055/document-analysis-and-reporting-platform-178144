import React from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';

/**
 * Root App renders the Dashboard page.
 * The Dashboard includes sidebar, progress bar, central content (upload/results),
 * and footer actions using the Ocean Professional theme.
 */
// PUBLIC_INTERFACE
function App() {
  return (
    <div className="app-root ocean-theme" data-theme="light">
      <Dashboard />
    </div>
  );
}

export default App;
