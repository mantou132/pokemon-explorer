import { GemElement, html, customElement, connectStore, refobject, RefObject, history } from '@mantou/gem';
import type { DuoyunListElement, PersistentState } from 'duoyun-ui/elements/list';

import { fetchFuturePokemonFeed, fetchPokemonFeed, pokemonFeedStore } from 'src/store/feed';

import 'duoyun-ui/elements/loading';
import 'duoyun-ui/elements/list';
import 'duoyun-ui/elements/action-text';
import 'src/elements/card';

let persistentState: PersistentState | undefined = undefined;

type State = {
  newContent: boolean;
};

@customElement('p-feed2')
@connectStore(pokemonFeedStore)
@connectStore(history.store)
export class Feed2 extends GemElement<State> {
  @refobject listRef: RefObject<DuoyunListElement>;

  state: State = {
    newContent: false,
  };

  #renderItem = (item: string) => html`<ele-card name=${item}></ele-card>`;
  #getKey = (item: string) => item;

  #onItemShow = ({ detail }: CustomEvent<string>) => {
    if (Number(detail) < -1) {
      this.setState({ newContent: false });
    }
  };

  #onForward = () => {
    console.log('forward');
    if (!pokemonFeedStore.futureLoading && pokemonFeedStore.list.length) {
      fetchFuturePokemonFeed(() => {
        this.setState({ newContent: true });
      });
    }
  };

  #onBackward = () => {
    console.log('backward');
    if (!pokemonFeedStore.loading) {
      fetchPokemonFeed();
    }
  };

  mounted() {
    // 模拟自动检查新内容
    setInterval(() => {
      console.log('auto forward');
      this.#onForward();
    }, 3000);

    // 如果没有 `routechange` 设置滚动可以使用 unmount
    this.effect(
      () => (persistentState = this.listRef.element?.persistentState),
      () => [history.getParams().path],
    );
  }

  render() {
    return html`
      <dy-list
        ref=${this.listRef.ref}
        .items=${pokemonFeedStore.list}
        .infinite=${true}
        .debug=${true}
        .renderItem=${this.#renderItem}
        .getKey=${this.#getKey}
        .persistentState=${persistentState}
        @forward=${this.#onForward}
        @backward=${this.#onBackward}
        @itemshow=${this.#onItemShow}
      >
        <div
          slot="before"
          style="position:sticky;top:0;z-index:1;height:0;overflow:visible;text-align:center;cursor:pointer;"
          ?hidden=${!this.state.newContent}
          @click=${() => this.listRef.element?.scrollContainer.scrollTo(0, 0)}
        >
          <div style="background:#4FC3F7;padding:1em;color:white;border-block:1em solid white;">新内容</div>
        </div>
        <div slot="after" style="text-align: center;" ?hidden=${!pokemonFeedStore.loading}>
          <dy-loading></dy-loading>
        </div>
        <div slot="after" style="text-align: center;" ?hidden=${!pokemonFeedStore.end}>
          <dy-action-text @click=${this.#onBackward}>没有更多数据</dy-action-text>
        </div>
      </dy-list>
    `;
  }
}
