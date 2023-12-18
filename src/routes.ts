import { html } from '@mantou/gem';
import { DuoyunRouteElement, RouteItem } from 'duoyun-ui/elements/route';

export const locationStore = DuoyunRouteElement.createLocationStore();

const home: RouteItem = {
  title: 'Pagination',
  pattern: '/',
  async getContent() {
    await import(/* webpackPrefetch: true */ 'src/pages/pagination');
    return html`<p-pagination></p-pagination>`;
  },
};

const feed: RouteItem = {
  title: 'Feed',
  pattern: '/feed',
  async getContent() {
    await import(/* webpackPrefetch: true */ 'src/pages/feed');
    return html`<p-feed></p-feed>`;
  },
};

const feed2: RouteItem = {
  title: 'Feed2',
  pattern: '/feed2',
  async getContent() {
    await import(/* webpackPrefetch: true */ 'src/pages/feed2');
    return html`<p-feed2></p-feed2>`;
  },
};

export default {
  home,
  feed,
  feed2,
};
