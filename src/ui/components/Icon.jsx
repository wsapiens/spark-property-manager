import React from 'react';
import feather from 'feather-icons';

export function Icon({ name, className }) {
  const icon = feather.icons[name];
  if (!icon) {
    return null;
  }

  return (
    <span
      className={className || ''}
      dangerouslySetInnerHTML={{ __html: icon.toSvg() }}
    />
  );
}
