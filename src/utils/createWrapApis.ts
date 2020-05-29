import { ApisBase, TrelaContextValue, WrapApis, Streamer } from "../types";

export const createWrapApis = <S, A extends ApisBase>(
  setup: (streamer: Streamer<S>) => void,
  context: TrelaContextValue<S, A>
): WrapApis<S, A> => {
  const { store, streamerMg } = context;

  return Object.keys(store.getOptions().apis || {}).reduce<WrapApis<S, A>>(
    (wrapApis, request) => {
      return {
        ...wrapApis,

        [request]: (...args: any[]) => {
          const streamer = streamerMg.createStreamer(request, args);

          setup(streamer);

          return streamer;
        },
      };
    },
    {} as WrapApis<S, A>
  );
};
