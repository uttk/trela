import { useContext } from "react";
import { useDependency } from "./useDependency";
import { DefaultTrelaContext } from "../utils/context";
import { createWrapApis } from "../utils/createWrapApis";
import { ApisBase, Streamer, TrelaApis, TrelaContextValue } from "../types";

export const useTrela = <S, A extends ApisBase>(): TrelaApis<S, A> => {
  const context = useContext<TrelaContextValue<S, A>>(DefaultTrelaContext);
  const dependency = useDependency(context);
  const { store, streamerMg } = context;

  const settingStreamer = (streamer: Streamer<S>) => {
    const id = streamer.id;

    streamer.addEventListener("once", () => {
      streamer.addEventListener("started", () => {
        if (dependency.didMount) {
          dependency.forceUpdate();
        }

        dependency.bookUpdate(id);
      });
    });

    streamer.addEventListener("finished", () => {
      dependency.tryUpdateView(id);
    });
  };

  return {
    apis: createWrapApis(dependency, context),

    getState: <R>(selector: (state: S) => [R] | [R, boolean]): R => {
      const [state] = selector(store.getState());

      return state;
    },

    steps: (streamers: Streamer<S>[]): Streamer<S> => {
      const streamer = streamerMg.createSeriesStreamer(streamers);

      settingStreamer(streamer);

      return streamer;
    },

    all: (streamers: Streamer<S>[]): Streamer<S> => {
      const streamer = streamerMg.createParallelStreamer(streamers);

      settingStreamer(streamer);

      return streamer;
    },
  };
};
