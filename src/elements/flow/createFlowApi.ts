import {
  FlowApi,
  FlowRequest,
  ExcludeNull,
  FlowDispatch,
  GetFlowResult,
} from "../../type";

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
