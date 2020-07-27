import { Flow, FlowApi } from "../type";

export const createFlowApi = <S>(
  flow: Flow<S, any>,
  setup: () => void
): FlowApi<S> => {
  return {
    id: flow.id,

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

    error: (payload: Error) => {
      setup();

      if (flow.status === "started") {
        flow.error(payload);
      }
    },
  };
};
