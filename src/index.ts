import { render, html } from '@mantou/gem';

import 'src/app';

render(
  html`
    <style>
      html {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
          'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overscroll-behavior: none;
        overflow-anchor: none;
      }
      body {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    </style>
    <app-root></app-root>
  `,
  document.body,
);

if (navigator.serviceWorker) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('/service-worker.js');
  });
}
