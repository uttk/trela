import { useContext } from "react";
import { useDependency } from "./useDependency";
import { DefaultTrelaContext } from "../utils/context";
import { createWrapApis } from "../utils/createWrapApis";
import { ApisBase, Streamer, TrelaApis, TrelaContextValue } from "../types";

export const useTrela = <S, A extends ApisBase>(): TrelaApis<S, A> => {
  const context = useContext<TrelaContextValue<S, A>>(DefaultTrelaContext);
  const { store, streamerMg } = context;

  const dependency = useDependency(context);

  const setup = (streamer: Streamer<S>) => {
    const id = streamer.id;

    streamer.addEventListener("beforeStart", () => {
      streamer.addEventListener("started", () => {
        if (dependency.didMount) {
          dependency.updateComponentView();
        }

        dependency.bookUpdate(id);
      });

      streamer.addEventListener("finished", () => {
        dependency.tryUpdateView(id);
      });
    });
  };

  return {
    apis: createWrapApis(setup, context),

    getState: <R>(selector: (state: S) => [R] | [R, boolean]): R => {
      const [state] = selector(store.getState());

      dependency.selectors.push(selector);

      return state;
    },

    steps: (streamers: Streamer<S>[]): Streamer<S> => {
      const streamer = streamerMg.createSeriesStreamer(streamers);

      setup(streamer);

      return streamer;
    },

    all: (streamers: Streamer<S>[]): Streamer<S> => {
      const streamer = streamerMg.createParallelStreamer(streamers);

      setup(streamer);

      return streamer;
    },
  };
};
