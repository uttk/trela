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
      flow.addEventCallback("cancel", flow.cancel);
      flow.addEventCallback("finished", allComplete);
      flow.addEventCallback("error", () => baseFlow.error(flow.currentError));

      flow.start();
    });
  };
};
