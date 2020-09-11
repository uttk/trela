export const sleep = (t: number) => new Promise((r) => setTimeout(r, t));

export const responseMockData = {
  users: Array(10)
    .fill(0)
    .map((_, id) => ({ id, name: "Example:" + id })),
};

export const apis = {
  checkLogin: async () => {
    await sleep(100);

    return true;
  },

  fetchUsers: async () => {
    await sleep(100);

    return responseMockData.users;
  },
};

type ResolveReturnType<F extends (args: any) => any> = F extends () => infer R
  ? R extends Promise<infer PR>
    ? PR
    : R
  : never;

export type ApisType = typeof apis;

export type ApiKeys = keyof ApisType;

export type Actions<K = ApiKeys> = K extends ApiKeys
  ? {
      type: K;
      payload: ResolveReturnType<ApisType[K]>;
    }
  : never;
