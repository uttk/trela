import { ApisBase } from "../type";
import { Flow, FlowApi } from "../type/flow";

export const createParallelRequest = <S, A extends ApisBase>(
  flowList: FlowApi<S>[]
) => {
  return (flow: Flow<S, A>) => {
    const max = flowList.length;
    let index = 0;

    const complete = () => {
      if (++index >= max) {
        flow.complete();
      }
    };

    flowList.forEach((flowApi) => {
      const removeCallbacks: Set<() => void> = new Set();
      const wrap = (callback: () => void) => {
        return () => {
          removeCallbacks.forEach((f) => f());
          removeCallbacks.clear();
          callback();
        };
      };

      removeCallbacks.add(flowApi.addEventListener("finished", wrap(complete)));
      removeCallbacks.add(flowApi.addEventListener("error", wrap(flow.error)));
      removeCallbacks.add(
        flowApi.addEventListener("cancel", wrap(flow.cancel))
      );

      flowApi.only.start();
    });
  };
};
