import * as React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">SQL Editor</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-300">Connected to Database</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
