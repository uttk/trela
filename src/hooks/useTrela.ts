import { useContext, useMemo } from "react";
import { useDependency } from "./useDependency";
import { DefaultTrelaContext } from "../utils/context";
import { createWrapApis } from "../utils/createWrapApis";
import {
  ApisBase,
  Selector,
  Streamer,
  TrelaApis,
  TrelaContextValue,
  StreamerStatus,
} from "../types";

export const useTrela = <S, A extends ApisBase>(): TrelaApis<S, A> => {
  const context = useContext<TrelaContextValue<S, A>>(DefaultTrelaContext);
  const { store, streamerMg, dependencyMg } = context;
  const dependency = useDependency(context);
  const removeListeners = useMemo<Set<() => void>>(() => new Set(), []);

  const setup = (streamer: Streamer<S>) => {
    const id = streamer.id;
    const addEvent = (status: StreamerStatus, cb: () => void) => {
      removeListeners.add(streamer.addEventListener(status, cb));
    };

    removeListeners.forEach((f) => f());
    removeListeners.clear();

    addEvent("started", () => {
      dependency.bookUpdate(id);

      if (dependency.canUpdate(id)) {
        dependencyMg.tryComponentUpdate((dep) => dependency.id === dep.id);
      }
    });

    addEvent("finished", () => {
      dependencyMg.tryComponentUpdate((dep) => dep.canUpdate(id));
    });
  };

  return {
    apis: createWrapApis(setup, context),

    getState: <R>(selector: Selector<S, R>): R => {
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
