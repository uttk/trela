import { ApisBase, Dependency, TrelaContextValue, WrapApis } from "../types";

export const createWrapApis = <S, A extends ApisBase>(
  dependency: Dependency,
  context: TrelaContextValue<S, A>
): WrapApis<S, A> => {
  const { store, streamerMg } = context;

  return Object.keys(store.getOptions().apis || {}).reduce<WrapApis<S, A>>(
    (wrapApis, request) => {
      return {
        ...wrapApis,

        [request]: (...args: any[]) => {
          const streamer = streamerMg.createStreamer(request, args);

          dependency.addStreamer(streamer);

          return streamer;
        },
      };
    },
    {} as WrapApis<S, A>
  );
};
