import React from 'react';

export const Icon = ({ name, className = '', style = {} }) => {
  return (
    <svg aria-hidden="true" className={className} style={style}>
      <use href={`#i-${name}`} />
    </svg>
  );
};
