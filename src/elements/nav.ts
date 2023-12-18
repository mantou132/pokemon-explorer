import { GemElement, html, customElement, adoptedStyle, createCSSSheet, css, state } from '@mantou/gem';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';
import { theme } from 'duoyun-ui/lib/theme';
import { icons } from 'duoyun-ui/lib/icons';

import routes from 'src/routes';

import 'duoyun-ui/elements/side-navigation';
import 'duoyun-ui/elements/use';

const style = createCSSSheet(css`
  :host {
    display: block;
    box-sizing: border-box;
    padding-inline: ${theme.gridGutter};
    padding-block: calc(4 * ${theme.gridGutter});
    background-color: ${theme.lightBackgroundColor};
    width: 16em;
    height: calc(100vh - 2 * ${theme.gridGutter});
    margin: ${theme.gridGutter};
    top: ${theme.gridGutter};
    border-radius: calc(2 * ${theme.gridGutter});
    position: sticky;
  }
  dy-side-navigation {
    gap: calc(${theme.gridGutter} / 2);
  }
  dy-use {
    display: none;
  }
  @media ${mediaQuery.PHONE} {
    :host(:not(:where([data-open], :--open, :state(open)))) {
      width: auto;
      height: auto;
      padding: 1em;
      position: static;
    }
    :host(:not(:where([data-open], :--open, :state(open)))) dy-side-navigation {
      display: none;
    }
    :host(:not(:where([data-open], :--open, :state(open)))) dy-use {
      display: block;
      width: 1.5em;
    }
    :host(:where([data-open], :--open, :state(open))) {
      z-index: 2;
      position: fixed;
      inset: ${theme.gridGutter};
      margin: 0;
      width: calc(100vw - 2 * ${theme.gridGutter});
    }
  }
`);

@customElement('ele-nav')
@adoptedStyle(style)
export class Nav extends GemElement {
  @state open: boolean;

  render() {
    return html`
      <dy-use @click=${() => (this.open = true)} .element=${icons.more}></dy-use>
      <dy-side-navigation
        @click=${{ handleEvent: () => (this.open = false), capture: true }}
        .items=${[routes.home, routes.feed, routes.feed2]}
      ></dy-side-navigation>
    `;
  }
}
