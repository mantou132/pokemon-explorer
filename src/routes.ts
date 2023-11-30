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

const about: RouteItem = {
  title: 'Feed',
  pattern: '/feed',
  async getContent() {
    await import(/* webpackPrefetch: true */ 'src/pages/feed');
    return html`<p-feed></p-feed>`;
  },
};

export default {
  home,
  about,
};
