import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-fintech-blue"></div>
    </div>
  );
};

export default Spinner;