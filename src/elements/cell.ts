import { html, adoptedStyle, customElement, createCSSSheet, css, attribute } from '@mantou/gem';
import { theme } from 'duoyun-ui/lib/theme';
import { DuoyunVisibleBaseElement } from 'duoyun-ui/elements/base/visible';

import { fetchPokemon, pokemonStore } from 'src/store/pokemon';

const style = createCSSSheet(css`
  :host {
    display: flex;
    border-radius: calc(2 * ${theme.gridGutter});
    aspect-ratio: 1;
    overflow: hidden;
    background: ${theme.lightBackgroundColor};
  }
  .img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    margin: auto;
  }
`);

/**
 * @customElement ele-cell
 */
@customElement('ele-cell')
@adoptedStyle(style)
export class AppCellElement extends DuoyunVisibleBaseElement {
  @attribute name: string;

  constructor() {
    super();
    this.addEventListener('visible', this.#onVisible, { once: true });
  }

  get #data() {
    return pokemonStore.pokemon[this.name];
  }

  #onVisible = () => {
    if (!this.#data) {
      fetchPokemon(this.name).then(() => this.update());
    }
  };

  render = () => {
    if (!this.name) return html``;
    if (!this.#data) {
      return html`<dy-loading class="img"></dy-loading>`;
    }
    return html`<img class="img" src=${this.#data.sprites.back_default} />`;
  };
}
