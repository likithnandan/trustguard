import React from 'react';

export function PageContainer({ children, style = {} }) {
  return (
    <main
      style={{
        flex: 1,
        padding: '24px 28px',
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto',
        ...style,
      }}
    >
      {children}
    </main>
  );
}

export default PageContainer;
