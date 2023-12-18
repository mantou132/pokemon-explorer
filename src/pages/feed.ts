import {
  GemElement,
  html,
  customElement,
  repeat,
  createCSSSheet,
  css,
  adoptedStyle,
  styleMap,
  connectStore,
  refobject,
  RefObject,
} from '@mantou/gem';
import { DuoyunVisibleBaseElement } from 'duoyun-ui/elements/base/visible';

import { fetchPokemonFeed, pokemonFeedStore } from 'src/store/feed';
import { Linked } from 'src/utils';

import 'duoyun-ui/elements/loading';
import 'src/elements/card';

@customElement('p-feed-item')
@adoptedStyle(
  createCSSSheet(css`
    :host {
      display: block;
    }
  `),
)
export class FeedItem extends DuoyunVisibleBaseElement {}

const style = createCSSSheet(css`
  :host {
    overflow-anchor: none;
  }
  [hidden] {
    display: none;
  }
`);

type State = {
  beforeHeight: number;
  renderList: string[];
  afterHeight: number;
};

type ItemValue = {
  height: number;
  element: FeedItem;
};

function isVisibility(ele: HTMLElement) {
  const { top, bottom } = ele.getBoundingClientRect();
  return bottom > 0 && top < innerHeight;
}

function isHidden(ele: HTMLElement) {
  const { top, bottom } = ele.getBoundingClientRect();
  return top > innerHeight + 300 || bottom < -300;
}

@customElement('p-feed')
@adoptedStyle(style)
@connectStore(pokemonFeedStore)
export class Feed extends GemElement<State> {
  @refobject beforeItemRef: RefObject<FeedItem>;
  @refobject afterItemRef: RefObject<FeedItem>;
  state: State = {
    beforeHeight: 0,
    renderList: [],
    afterHeight: 0,
  };

  #reLayout = () => {
    const renderList: string[] = [];
    const { top } = this.getBoundingClientRect();
    let beforeHeight = 0;
    let renderHeight = 0;
    let afterHeight = 0;
    for (const node of this.#linked) {
      if (!node.value) {
        console.error('reLayout', node);
        break;
      }
      if (top + beforeHeight + renderHeight > innerHeight) {
        afterHeight += node.value.height;
      } else if (top + beforeHeight + node.value.height > 0) {
        renderList.push(node.nodeValue!);
        renderHeight += node.value.height;
      } else {
        beforeHeight += node.value.height;
      }
    }
    this.setState({ beforeHeight, renderList, afterHeight });
  };

  #onBeforeItemVisible = () => {
    if (!isVisibility(this.beforeItemRef.element!)) return;
    if (!this.state.renderList.at(0) && pokemonFeedStore.list.length && this.state.beforeHeight > 0) {
      this.#reLayout();
      return;
    }

    // 隐藏后面的
    let afterHeight = 0;
    let len = this.state.renderList.length;
    for (let i = len - 1; i >= 0; i--) {
      const node = this.#linked.get(this.state.renderList[i]);
      if (node?.value && isHidden(node.value.element)) {
        afterHeight += node.value.height;
        len--;
      } else {
        break;
      }
    }
    console.log('onBeforeItemVisible afterHeight', afterHeight);
    this.setState({
      renderList: this.state.renderList.splice(0, len),
      afterHeight: this.state.afterHeight + afterHeight,
    });

    const newRenderedFirstItem = this.state.renderList.at(0);
    if (!newRenderedFirstItem) return;
    if (newRenderedFirstItem === pokemonFeedStore.list.at(0)) {
      this.setState({ beforeHeight: 0 });
      return;
    }

    // 显示前面的
    const appendList: string[] = [];
    let node = this.#linked.previous(newRenderedFirstItem);
    let beforeHeight = 0;
    for (let i = 0; i < 10; i++) {
      if (!node?.value) break;
      beforeHeight += node.value.height;
      appendList.unshift(node.nodeValue!);
      node = this.#linked.previous(node.nodeValue!);
    }
    console.log('onBeforeItemVisible -beforeHeight', beforeHeight);
    this.setState({
      renderList: appendList.concat(this.state.renderList),
      beforeHeight: Math.max(0, this.state.beforeHeight - beforeHeight),
    });
  };

  #onAfterItemVisible = async () => {
    if (!isVisibility(this.afterItemRef.element!)) return;
    if (pokemonFeedStore.end) {
      this.setState({ afterHeight: 0 });
      return;
    }
    const renderedLastItem = this.state.renderList.at(-1);
    if (renderedLastItem === pokemonFeedStore.list.at(-1) && !pokemonFeedStore.loading) {
      await fetchPokemonFeed();
      return;
    }

    // 隐藏前面的
    let len = 0;
    let beforeHeight = 0;
    for (const id of this.state.renderList) {
      const node = this.#linked.get(id);
      if (node?.value && isHidden(node.value.element)) {
        len++;
        beforeHeight += node.value.height;
      }
    }
    console.log('onAfterItemVisible beforeHeight', beforeHeight);
    this.setState({
      renderList: this.state.renderList.splice(len),
      beforeHeight: this.state.beforeHeight + beforeHeight,
    });

    // 显示后面的
    const newRenderedLastItem = this.state.renderList.at(-1);
    if (!newRenderedLastItem && pokemonFeedStore.list.length && this.state.afterHeight > 0) {
      this.#reLayout();
      return;
    }
    const appendList: string[] = [];
    let afterHeight = 0;
    let node = newRenderedLastItem ? this.#linked.next(newRenderedLastItem) : this.#linked.first();
    for (let i = 0; i < 10; i++) {
      if (!node) break;
      appendList.push(node.nodeValue!);
      node = this.#linked.next(node.nodeValue!);
      if (node?.value) {
        afterHeight += node.value.height;
      }
    }
    console.log('onAfterItemVisible -afterHeight', afterHeight);
    this.setState({
      renderList: this.state.renderList.concat(appendList),
      afterHeight: Math.max(0, this.state.afterHeight - afterHeight),
    });
  };

  #linked = new Linked<ItemValue>();

  willMount = () => {
    this.memo(
      () => {
        pokemonFeedStore.list.forEach((id) => {
          if (!this.#linked.get(id)) this.#linked.append(id);
        });
        if (this.afterItemRef.element && isVisibility(this.afterItemRef.element)) {
          this.#onAfterItemVisible();
        }
      },
      () => [pokemonFeedStore.list],
    );
  };

  mounted = () => {
    addEventListener('scrollend', () => {
      if (isVisibility(this.beforeItemRef.element!)) this.#onBeforeItemVisible();
      if (isVisibility(this.afterItemRef.element!)) this.#onAfterItemVisible();
    });
    this.effect(() => {
      console.log('renderList', this.state.renderList);
      [...this.shadowRoot!.querySelectorAll<FeedItem>('[id]')].forEach((element) => {
        const node = this.#linked.get(element.id);
        if (node && !node.value) {
          const { height } = element.getBoundingClientRect();
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          node.value = {
            height,
            get element() {
              // repeat 不完美工作
              return self.shadowRoot!.querySelector<FeedItem>(`[id="${element.id}"]`)!;
            },
          };
        }
      });
    });
  };

  render() {
    return html`
      <p-feed-item
        ref=${this.beforeItemRef.ref}
        @show=${this.#onBeforeItemVisible}
        style=${styleMap({ height: this.state.beforeHeight + 'px' })}
      ></p-feed-item>
      ${repeat(
        this.state.renderList,
        (name) => name,
        (name) => html`
          <p-feed-item id=${name}>
            <ele-card name=${name}></ele-card>
          </p-feed-item>
        `,
      )}
      <div style="text-align: center;">
        ${pokemonFeedStore.end ? 'No Data' : ''}
        <dy-loading ?hidden=${!pokemonFeedStore.loading}></dy-loading>
      </div>
      <p-feed-item
        ref=${this.afterItemRef.ref}
        @show=${this.#onAfterItemVisible}
        style=${styleMap({ height: this.state.afterHeight + 'px' })}
      ></p-feed-item>
    `;
  }
}
