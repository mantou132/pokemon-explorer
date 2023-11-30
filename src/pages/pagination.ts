import { GemElement, html, customElement, connectStore, repeat, createCSSSheet, css, adoptedStyle } from '@mantou/gem';
import { theme } from 'duoyun-ui/lib/theme';
import { mediaQuery } from '@mantou/gem/helper/mediaquery';

import { pokemonStore, fetchPokemonList } from 'src/store/pokemon';
import { changeQuery } from 'src/utils';
import { locationStore } from 'src/routes';

import 'duoyun-ui/elements/pagination';
import 'duoyun-ui/elements/loading';
import 'src/elements/cell';

const sizes = [20, 50, 100];
const style = createCSSSheet(css`
  :host {
    display: flex;
    flex-direction: column;
    gap: ${theme.gridGutter};
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    grid-template-rows: max-content;
    gap: ${theme.gridGutter};
  }
  dy-loading {
    position: fixed;
    right: ${theme.gridGutter};
    bottom: ${theme.gridGutter};
  }
  dy-pagination {
    justify-content: center;
  }
  [hidden] {
    display: none;
  }
`);

@customElement('p-pagination')
@adoptedStyle(style)
@connectStore(pokemonStore)
@connectStore(locationStore)
export class Home extends GemElement {
  get #size() {
    return Number(locationStore.query.get('size')) || 20;
  }

  get #page() {
    return Number(locationStore.query.get('page')) || 1;
  }

  get #data() {
    return pokemonStore.pagination[this.#page];
  }

  #sizeChange = ({ detail }: CustomEvent<number>) => {
    changeQuery('size', String(detail));
  };

  #pageChange = ({ detail }: CustomEvent<number>) => {
    changeQuery('page', String(detail));
  };

  mounted() {
    this.effect(
      () => {
        fetchPokemonList({ size: this.#size, page: this.#page });
      },
      () => [locationStore.query],
    );
  }

  render() {
    return html`
      <dy-loading ?hidden=${!this.#data?.loading}></dy-loading>
      <div class="grid">
        ${repeat(
          this.#data?.results || new Array(this.#size).fill(''),
          (name) => name,
          (name) => html`<ele-cell name=${name}></ele-cell>`,
        )}
      </div>
      <dy-pagination
        .page=${this.#page}
        .size=${this.#size}
        .total=${pokemonStore.total}
        .sizes=${mediaQuery.isSmallPhone ? undefined : sizes}
        @pagechange=${this.#pageChange}
        @sizechange=${this.#sizeChange}
      ></dy-pagination>
    `;
  }
}
