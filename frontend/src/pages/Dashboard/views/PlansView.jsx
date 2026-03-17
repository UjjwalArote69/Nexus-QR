import React from 'react';
import Pricing from '../../../components/Pricing'; // Adjust this path to where your Pricing.jsx is saved

const PlansView = () => {
  return (
    // The 'flex-1 overflow-y-auto' makes this specific view scrollable 
    // without moving the Sidebar or Topbar!
    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 transition-colors duration-300">
      <Pricing />
    </div>
  );
};

export default PlansView;