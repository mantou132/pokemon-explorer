import {
  GemElement,
  html,
  adoptedStyle,
  customElement,
  createCSSSheet,
  css,
  attribute,
  classMap,
  TemplateResult,
} from '@mantou/gem';
import { theme } from 'duoyun-ui/lib/theme';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { fetchPokemon, pokemonStore } from 'src/store/pokemon';
import 'duoyun-ui/elements/placeholder';

const style = createCSSSheet(css`
  :host {
    display: block;
    padding-block-end: ${theme.gridGutter};
  }
  .content {
    display: grid;
    grid-template: 'img title' 'img info' 1fr / auto 1fr;
    gap: ${theme.gridGutter};
    border-radius: calc(2 * ${theme.gridGutter});
    border: 1px solid ${theme.borderColor};
    padding: ${theme.gridGutter};
  }
  .img {
    background: ${theme.lightBackgroundColor};
    grid-area: img;
    aspect-ratio: 1;
    width: 12em;
    border-radius: ${theme.gridGutter};
    overflow: hidden;
  }
  .img[src='']::before {
    display: block;
    content: '';
    width: 100%;
    height: 100%;
  }
  .title {
    margin: 0;
    font-size: 2em;
    font-weight: bolder;
    text-transform: capitalize;
    span {
      margin-inline-start: 0.5em;
      opacity: 0.5;
    }
  }
  .info {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7em, 1fr));
    grid-template-rows: max-content;
    margin: 0;
    padding: 0;
    list-style: none;
    gap: 1em;
    li {
      display: flex;
      flex-direction: column;
      gap: 0.2em;
      :first-of-type {
        font-size: 0.875em;
        opacity: 0.6;
      }
      :last-of-type {
        font-size: 1.25em;
        font-weight: bolder;
      }
    }
  }

  @media ${mediaQuery.PHONE} {
    .content {
      display: flex;
      flex-direction: column;
      img {
        width: auto;
      }
    }
  }
`);

/**
 * @customElement ele-card
 */
@customElement('ele-card')
@adoptedStyle(style)
export class AppCardElement extends GemElement {
  @attribute name: string;

  get #data() {
    return pokemonStore.pokemon[this.name];
  }

  #info?: (string | number | TemplateResult)[][] = [];
  willMount = () => {
    this.memo(() => {
      this.#info = this.#data && [
        ['Height', this.#data.height || ''],
        ['Base Experience', this.#data.base_experience || ''],
        ['Weight', this.#data.weight || ''],
        ['Abilities', this.#data.abilities.length || ''],
        ['Type', this.#data.types.map((e) => e.type.name).join()],
      ];
    });
  };

  mounted = () => {
    if (!this.#data) {
      fetchPokemon(this.name).then(() => this.update());
    }
  };

  render = () => {
    return html`
      <div class=${classMap({ content: true, loading: !this.#data })}>
        <img class="img" src=${this.#data?.sprites.back_default || ''} />
        <h2 class="title">${this.name}<span>#${this.#data?.id}</span></h2>
        ${this.#info
          ? html`
              <ul class="info">
                ${this.#info.map(([key, value]) => html`<li><span>${key}</span><span>${value}</span></li>`)}
              </ul>
            `
          : html`<dy-placeholder mode="multi" min-line="4"></dy-placeholder>`}
      </div>
    `;
  };
}
