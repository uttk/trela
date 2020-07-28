import { Flow, FlowApi, ApisBase } from "../type";

export const createSeriesRequest = <S, A extends ApisBase>(
  flowApis: FlowApi<S>[]
) => {
  return (flow: Flow<S, A>) => {
    const len = flowApis.length;

    let index = 0;

    const affect = () => {
      if (index >= len) return flow.complete();

      const flowApi = flowApis[index++];
      const removeCallbacks: Set<() => void> = new Set();
      const wrap = (callback: () => void) => {
        return () => {
          removeCallbacks.forEach((f) => f());
          removeCallbacks.clear();
          callback();
        };
      };

      removeCallbacks.add(flowApi.addEventListener("finished", () => affect()));
      removeCallbacks.add(flowApi.addEventListener("error", wrap(flow.error)));
      removeCallbacks.add(
        flowApi.addEventListener("cancel", wrap(flow.cancel))
      );

      flowApi.start();
    };

    affect();
  };
};
