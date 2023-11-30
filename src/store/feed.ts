import { updateStore } from '@mantou/gem';
import { createCacheStore } from 'duoyun-ui/lib/utils';

import * as api from 'src/service/api';

const limit = 20;

type PokemonFeedStore = {
  loading: boolean;
  list: string[];
  offset: number;
  end: boolean;
};

export const [pokemonFeedStore] = createCacheStore<PokemonFeedStore>(
  'pokemonFeedStore4',
  {
    loading: false,
    list: [],
    offset: 0,
    end: false,
  },
  { cacheExcludeKeys: ['loading', 'end'] },
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
