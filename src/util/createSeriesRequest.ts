import { ApisBase } from "../type";
import { Flow } from "../type/flow";

export const createSeriesRequest = <S, A extends ApisBase>(
  flowList: Flow<S, A>[]
) => {
  return (baseFlow: Flow<S, A>) => {
    const len = flowList.length;
    const removeCallbacks: Set<() => void> = new Set();

    let index = 0;

    const affect = () => {
      removeCallbacks.forEach((f) => f());
      removeCallbacks.clear();

      if (baseFlow.status !== "started") return;
      if (index >= len) return baseFlow.complete();

      const flow = flowList[index++];

      switch (flow.status) {
        case "finished":
          affect();
          break;

        case "cancel":
          baseFlow.cancel();
          break;

        case "error":
          baseFlow.error(flow.currentError);
          break;

        case "started": {
          const errorHandle = () => baseFlow.error(flow.currentError);

          removeCallbacks.add(flow.addEventCallback("finished", affect));
          removeCallbacks.add(flow.addEventCallback("error", errorHandle));
          removeCallbacks.add(flow.addEventCallback("cancel", flow.cancel));

          flow.start();
          break;
        }
      }
    };

    affect();
  };
};
