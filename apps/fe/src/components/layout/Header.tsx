import * as React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white p-2 shadow-md">
      <div className="container mx-auto flex items-center">
        <h1 className="text-xl font-bold">SQL Editor</h1>
      </div>
    </header>
  );
};

export default Header;
