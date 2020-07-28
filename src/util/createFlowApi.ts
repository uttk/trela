import { Flow, FlowApi } from "../type";

export const createFlowApi = <S>(
  flow: Flow<S, any>,
  setup: () => void
): FlowApi<S> => {
  return {
    ...createApis(flow, setup),
    id: flow.id,
    only: createApis(flow, () => void 0),
    addEventListener: (type, callback) => {
      return flow.addEventListener(type, callback);
    },
  };
};

const createApis = <S>(
  flow: Flow<S, any>,
  setup: () => void
): Omit<FlowApi<S>, "id" | "addEventListener" | "only"> => {
  return {
    once: () => {
      setup();

      if (flow.status === "none") {
        flow.start();
      }

      return [flow.getStore().getState(), flow.status === "started"];
    },

    start: () => {
      setup();

      if (flow.status !== "started") {
        flow.start();
      }
    },

    forceStart: () => {
      setup();

      flow.cancel();
      flow.start();
    },

    cancel: () => {
      setup();

      if (flow.status === "started") {
        flow.cancel();
      }
    },

    error: (payload) => {
      setup();

      if (flow.status === "started") {
        flow.error(payload);
      }
    },
  };
};
