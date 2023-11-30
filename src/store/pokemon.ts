import { updateStore } from '@mantou/gem';
import { createCacheStore } from 'duoyun-ui/lib/utils';

import * as api from 'src/service/api';

type PokemonPageInit = { results?: string[]; loading?: boolean };

type PokemonStore = {
  total: number;
  pagination: Partial<{
    [k: number]: PokemonPageInit;
  }>;
  pokemon: Partial<{
    [k: string]: api.Item;
  }>;
  pokemonLoader: Partial<Record<string, ReturnType<typeof api.getItem>>>;
};

export const [pokemonStore] = createCacheStore<PokemonStore>(
  'pokemonStore1',
  {
    total: 0,
    pagination: {},
    pokemon: {},
    pokemonLoader: {},
  },
  { cacheExcludeKeys: ['pokemonLoader'] },
);

function changePage(page: number, content: Partial<PokemonPageInit>) {
  updateStore(pokemonStore, {
    pagination: {
      ...pokemonStore.pagination,
      [page]: { ...pokemonStore.pagination[page], ...content },
    },
  });
}

export const fetchPokemonList = async (args: api.PaginationReq) => {
  changePage(args.page, { loading: true });
  try {
    const list = await api.getList(args);
    changePage(args.page, { results: list.results.map((e) => e.name) });
    updateStore(pokemonStore, { total: Math.ceil(list.count / args.size) });
  } finally {
    changePage(args.page, { loading: false });
  }
};

export const fetchPokemon = async (name: string) => {
  if (pokemonStore.pokemonLoader[name]) return;
  const loader = api.getItem(name);
  pokemonStore.pokemonLoader[name] = loader;
  updateStore(pokemonStore);
  try {
    const item = await loader;
    updateStore(pokemonStore, {
      pokemon: {
        ...pokemonStore.pokemon,
        [item.name]: item,
      },
    });
  } finally {
    delete pokemonStore.pokemonLoader[name];
    updateStore(pokemonStore);
  }
};
