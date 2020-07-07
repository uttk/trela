import { Flow, FlowMethods } from "../../types";

type FlowMethodKeys = keyof FlowMethods<any>;

export const createFlowMethods = <S>(
  dispach: <K extends FlowMethodKeys>(
    type: K,
    payload?: Parameters<FlowMethods<S>[K]>
  ) => Flow<S>
): FlowMethods<S> => {
  return {
    finish: (...payloads) => {
      dispach("finish", payloads);
    },

    cancel(payload?: any) {
      dispach("cancel", payload);
    },

    error(...payloads) {
      dispach("error", payloads);
    },

    once: () => {
      const flow = dispach("once");

      return [flow.getState(), flow.status === "started"];
    },

    start: () => {
      dispach("start");
    },

    forceStart: (...payloads) => {
      dispach("forceStart", payloads);
    },
  };
};
