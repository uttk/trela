import { Flow, FlowStore, FlowRequest } from "../../type";
import { cancelablePromise } from "../promise";
import { createFlow } from "./creators";

export const returnFlow = <R>(
  store: FlowStore,
  request: FlowRequest<R>
): Flow<R> => {
  const { flows } = store;
  const flowId = request.id;
  const cache = flows.get(flowId);

  if (cache) return cache;

  const flow = createFlow(flowId, request.createPromise);

  flows.set(flowId, flow);

  return flow;
};

export const requestFlow = <R>(
  flowStore: FlowStore,
  request: FlowRequest<R>,
  onComplete: () => void
): Flow<R> => {
  const flows = flowStore.flows;
  const flow = returnFlow(flowStore, request);
  const { action, createPromise } = request;

  if (action === "read" && !flow.isFirst) return flow;
  if (action === "cancel") return flow.cancel?.(), flow;

  if (flow.promise) return flow;

  const [promise, cancel] = cancelablePromise(createPromise());

  const newFlow: Flow<R> = {
    ...flow,

    cancel,
    createPromise,

    isFirst: false,
    isProgress: true,
    promise: promise.then((result) => {
      flows.set(flow.id, {
        ...flow,
        result,
        isFirst: false,
        isProgress: false,
        promise: null,
      });

      onComplete();

      return result;
    }),
  };

  flows.set(newFlow.id, newFlow);

  return newFlow;
};
