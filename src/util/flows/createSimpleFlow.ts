import { createFlowMethods } from "./createFlowMethods";
import { TrelaContextValue, Dispacher, FlowMethods } from "../../types";

export const createSimpleFlow = <S>(
  context: TrelaContextValue<S, any>,
  dispacher: Dispacher
): FlowMethods<S> => {
  return createFlowMethods(() => {
    return {
      id: dispacher.id,
      status: "none",
      getState: () => context.store,
    };
  });
};
