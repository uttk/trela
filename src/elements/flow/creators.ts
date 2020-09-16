import { Flow, FlowId, FlowStore, PromiseCreator } from "../../type";

export const createFlowStore = (): FlowStore => {
  return {
    flowKeys: new Map(),
    flows: new Map(),
  };
};

export const createFlow = <R>(
  id: FlowId,
  createPromise: PromiseCreator<R>
): Flow<R> => {
  return {
    id,
    cancel: null,
    result: null,
    promise: null,
    isFirst: true,
    isProgress: false,
    createPromise,
  };
};
