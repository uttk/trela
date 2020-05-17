import { Store, ApisBase, Affecters, CreateAction } from "../types";

// eslint-disable-next-line prettier/prettier
export const createAffecters = <S, A extends ApisBase>(store: Store<S, A>): Affecters => {
  const { apis, affecters } = store.getOptions();
  const newAffecters = affecters ? affecters(store) : void 0;

  return {
    request: (effect, next) => {
      next({ ...effect, type: "resolve" });
    },

    resolve: (efffect, next) => {
      if (!apis) return;

      const api = apis[efffect.request];

      if (api) {
        const value = api(...efffect.payload);

        if (value instanceof Promise) {
          value
            .then((payload) => next({ ...efffect, type: "done", payload }))
            .catch((payload) => next({ ...efffect, type: "error", payload }));
        } else {
          next({ ...efffect, type: "done", payload: value });
        }

        return;
      }

      throw new Error(
        "The requested API was not found. request : " + efffect.request
      );
    },

    done: (effect, _, done) => {
      const action = {
        type: effect.request,
        payload: effect.payload,
      } as CreateAction<keyof A, A>;

      store.dispatch(action);

      done(effect);
    },

    cancel: () => {},

    error: (effect) => {
      throw effect.payload;
    },

    ...newAffecters,
  };
};
