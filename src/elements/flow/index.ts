import {
  Flow,
  FlowId,
  FlowApi,
  FlowStore,
  FlowRequest,
  ExcludeNull,
  FlowDispatch,
  GetFlowResult,
  PromiseCreator,
} from "../../type";
import { cancelablePromise } from "../promise";

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
  flow: Flow<R>,
  request: FlowRequest<R>,
  onComplete: (result: R | null) => void
): Flow<R> => {
  const { action, createPromise } = request;

  if (action === "read" && !flow.isFirst) return flow;
  if (action === "cancel") return flow.cancel?.(), flow;
  if (flow.promise) return flow;

  const [promise, cancel] = cancelablePromise(createPromise());

  promise.then(onComplete);

  return {
    ...flow,
    promise,
    isFirst: false,
    isProgress: true,
    cancel,
    createPromise,
  };
};

export const createFlowApi = <
  F extends FlowRequest<any>,
  R extends GetFlowResult<F>
>(
  request: F,
  dispatch: FlowDispatch
): FlowApi<R> => {
  const canUpdate: FlowDispatch = (req) => dispatch({ ...req });
  const notUpdated: FlowDispatch = (req) =>
    dispatch({ ...req, fromDependency: null });

  return {
    ...createApis(request, canUpdate),

    id: request.id,

    only: createApis(request, notUpdated),

    getRequest: () => request,

    default: (defaultValue) => {
      return {
        ...createResolvedApis(request, canUpdate, defaultValue),

        id: request.id,

        only: createResolvedApis(request, notUpdated, defaultValue),

        getRequest: () => request,
      };
    },
  };
};

const createApis = <F extends FlowRequest<any>, R extends GetFlowResult<F>>(
  request: F,
  dispatch: FlowDispatch
): Omit<FlowApi<R>, "id" | "default" | "only" | "getRequest"> => {
  return {
    read: () => {
      const flow = dispatch({ ...request, action: "read" });

      return [flow.result, flow.isProgress];
    },

    start: () => {
      dispatch({ ...request, action: "start" });
    },

    cancel: () => {
      dispatch({ ...request, action: "cancel" });
    },
  };
};

const createResolvedApis = <
  F extends FlowRequest<any>,
  R extends GetFlowResult<F>,
  D extends ExcludeNull<R>
>(
  request: F,
  dispatch: FlowDispatch,
  defaultValue: D
): Omit<FlowApi<D>, "id" | "default" | "only" | "getRequest"> => {
  return {
    read: () => {
      const flow = dispatch({ ...request, action: "read" });

      return [flow.result || defaultValue, flow.isProgress] as [D, boolean];
    },

    start: () => {
      dispatch({ ...request, action: "start" });
    },

    cancel: () => {
      dispatch({ ...request, action: "cancel" });
    },
  };
};
