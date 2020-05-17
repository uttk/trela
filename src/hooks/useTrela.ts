import { useContext } from "react";
import { useDependency } from "./useDependency";
import { DefaultTrelaContext } from "../utils/context";
import { createWrapApis } from "../utils/createWrapApis";
import { ApisBase, Streamer, TrelaApis, TrelaContextValue } from "../types";

export const useTrela = <S, A extends ApisBase>(): TrelaApis<S, A> => {
  const context = useContext<TrelaContextValue<S, A>>(DefaultTrelaContext);
  const dependency = useDependency(context);
  const { streamerMg } = context;

  return {
    apis: createWrapApis(dependency, context),

    steps: (streamers: Streamer<S>[]): Streamer<S> => {
      const streamer = streamerMg.createSeriesStreamer(streamers);

      streamers.forEach((item) => dependency.deleteStreamer(item.id));
      dependency.addStreamer(streamer);

      return streamer;
    },

    all: (streamers: Streamer<S>[]): Streamer<S> => {
      const streamer = streamerMg.createParallelStreamer(streamers);

      streamers.forEach((item) => dependency.deleteStreamer(item.id));
      dependency.addStreamer(streamer);

      return streamer;
    },
  };
};
