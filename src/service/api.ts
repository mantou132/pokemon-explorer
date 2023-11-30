import { get } from '@mantou/gem/helper/request';

const API = 'https://pokeapi.co/api/v2';
export type List = typeof import('./list.json');
export type Item = typeof import('./item.json');

export type PaginationReq = {
  page: number;
  size: number;
};

export async function getList(args: PaginationReq) {
  return get<List>(`${API}/pokemon`, {
    offset: args.size * (args.page - 1),
    limit: args.size,
  });
}

export type FeedReq = {
  offset: number;
  limit: number;
};

export async function getListFeed(args: FeedReq) {
  return get<List>(`${API}/pokemon`, args);
}

export async function getItem(name: string) {
  return get<Item>(`${API}/pokemon/${name}`);
}
