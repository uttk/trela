type ResolveReturnType<F extends (args: any) => any> = F extends () => infer R
  ? R extends Promise<infer PR>
    ? PR
    : R
  : never;

export interface StateType {
  isLogin: boolean;
  users: Array<{ id: number; name: string }>;
}

export type ApisType = typeof apis;

export type ApiKeys = keyof ApisType;

export type Actions<K = ApiKeys> = K extends ApiKeys
  ? {
      type: K;
      payload: ResolveReturnType<ApisType[K]>;
    }
  : never;

export const sleep = (t: number) => new Promise((r) => setTimeout(r, t));

export const randomSleep = (max: number = 150) => {
  return sleep(Math.floor(Math.random() * max));
};

export const initState: StateType = {
  isLogin: false,
  users: [],
};

export const responseMockData = {
  users: Array(10)
    .fill(0)
    .map((_, id) => ({ id, name: "Example:" + id })),
};

export const apis = {
  checkLogin: async () => {
    await randomSleep();

    return true;
  },

  fetchUsers: async () => {
    await randomSleep();

    return responseMockData.users;
  },
};

export const reducer = (state: StateType, action: Actions): StateType => {
  switch (action.type) {
    case "checkLogin":
      return { ...state, isLogin: action.payload };

    case "fetchUsers":
      return { ...state, users: action.payload };

    default:
      return state;
  }
};
