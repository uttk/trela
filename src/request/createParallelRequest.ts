import { ApisBase } from "../type";
import { Flow } from "../type/flow";

export const createParallelRequest = <S, A extends ApisBase>(
  flowList: Flow<S, A>[]
) => {
  return (baseFlow: Flow<S, A>) => {
    const max = flowList.length;
    let index = 0;

    const allComplete = () => {
      if (++index >= max) {
        baseFlow.complete();
      }
    };

    flowList.forEach((flow) => {
      const removeCallbacks: Set<() => void> = new Set();
      const clear = () => {
        removeCallbacks.forEach((f) => f());
        removeCallbacks.clear();
      };

      removeCallbacks.add(
        flow.addEventCallback("finished", () => {
          clear();
          allComplete();
        })
      );
      removeCallbacks.add(
        flow.addEventCallback("cancel", () => {
          clear();
          baseFlow.cancel();
        })
      );
      removeCallbacks.add(
        flow.addEventCallback("error", () => {
          clear();
          baseFlow.error(flow.currentError);
        })
      );

      flow.start();
    });
  };
};
