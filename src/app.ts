import { html, GemElement, customElement } from '@mantou/gem';
import { updateTheme, theme } from 'duoyun-ui/lib/theme';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import routes, { locationStore } from 'src/routes';

import 'duoyun-ui/elements/route';
import 'src/elements/nav';

updateTheme({
  normalRound: '8px',
});

@customElement('app-root')
export class App extends GemElement {
  #onRouteChange = () => {
    document.body.scrollTo(0, 0);
  };

  render() {
    return html`
      <style>
        :host {
          display: flex;
          width: 100%;
          max-width: 1024px;
          margin: auto;
        }
        main {
          flex-grow: 1;
          padding: ${theme.gridGutter};
        }

        @media ${mediaQuery.PHONE} {
          :host {
            flex-direction: column;
          }
        }
      </style>
      <ele-nav></ele-nav>
      <main>
        <dy-route .routes=${routes} .locationStore=${locationStore} @routechange=${this.#onRouteChange}></dy-route>
      </main>
    `;
  }
}
