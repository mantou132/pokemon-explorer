import { updateStore } from '@mantou/gem';
import { createCacheStore, once, sleep } from 'duoyun-ui/lib/utils';

import * as api from 'src/service/api';
import { pokemonStore } from 'src/store/pokemon';

const limit = 20;

type PokemonFeedStore = {
  futureLoading: boolean;
  loading: boolean;
  list: string[];
  offset: number;
  end: boolean;
};

export const [pokemonFeedStore] = createCacheStore<PokemonFeedStore>(
  'pokemonFeedStore4',
  {
    futureLoading: false,
    loading: false,
    end: false,
    list: [],
    offset: 0,
  },
  { cacheExcludeKeys: ['futureLoading', 'loading', 'end', 'list', 'offset'] },
);

export const fetchPokemonFeed = async () => {
  updateStore(pokemonFeedStore, { loading: true, end: false });
  try {
    const list = await api.getListFeed({ offset: pokemonFeedStore.offset, limit });
    updateStore(pokemonFeedStore, {
      list: pokemonFeedStore.list.concat(list.results.map((e) => e.name)),
      offset: pokemonFeedStore.offset + list.results.length,
      end: pokemonFeedStore.offset + list.results.length === list.count,
    });
  } finally {
    updateStore(pokemonFeedStore, { loading: false });
  }
};

export const fetchFuturePokemonFeed = once(async (callback?: () => void) => {
  const first = await import('../service/item.json');
  updateStore(pokemonFeedStore, { futureLoading: true });
  await sleep(1000);
  const list = Array.from({ length: 20 }, (_, index) => {
    const id = 0 - (index + 1);
    const item = { ...first, id, name: String(id) };
    pokemonStore.pokemon[id] = item;
    return String(id);
  }).reverse();
  console.log('fetchFuturePokemonFeed', list);
  updateStore(pokemonFeedStore, {
    list: list.concat(pokemonFeedStore.list),
    futureLoading: false,
  });
  callback?.();
});
