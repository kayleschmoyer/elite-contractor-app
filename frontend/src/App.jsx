// frontend/src/App.jsx
import React from 'react';
import ProjectList from './features/projects/ProjectList';
// Import Header, Sidebar, Footer etc. later
// import Header from './components/layout/Header';

function App() {
  // Basic layout - replace with Router later
  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      {/* <Header /> */}
      <h1>Elite Contractor App</h1>
      <main>
        <ProjectList />
        {/* Add Router and other pages here */}
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default App;