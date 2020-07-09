import { Flow, TrelaContextValue, Dispacher, FlowStatus } from "../types";

export const createFlow = <S>(
  context: TrelaContextValue<S, any>,
  dispacher: Dispacher
): Flow<S> => {
  const eventCallbacks: Map<FlowStatus, Set<() => void>> = new Map();

  return {
    id: dispacher.id,

    addEventListener: (event, callback) => {
      const callbacks = eventCallbacks.get(event) || new Set();

      callbacks.add(callback);

      return () => callbacks.delete(callback);
    },

    once() {
      dispacher.dispatch(context, {
        status: "started",
        payload: void 0,
        canDispach: dispacher.status === "none",
      });

      return [context.store, dispacher.status === "started"];
    },

    start() {
      dispacher.dispatch(context, {
        status: "started",
        payload: void 0,
        canDispach: dispacher.status !== "started",
      });
    },

    forceStart(cancel?: boolean, payload?: any) {
      if (cancel) {
        dispacher.dispatch(context, {
          payload,
          status: "cancel",
          canDispach: dispacher.status === "started",
        });
      }

      dispacher.dispatch(context, {
        status: "started",
        payload: void 0,
        canDispach: true,
      });
    },

    cancel(payload?: any) {
      dispacher.dispatch(context, {
        payload,
        status: "cancel",
        canDispach: dispacher.status === "started",
      });
    },

    error(payload: Error) {
      dispacher.dispatch(context, {
        payload,
        status: "error",
        canDispach: dispacher.status === "started",
      });
    },

    finish(payload?: any) {
      dispacher.dispatch(context, {
        payload,
        status: "finished",
        canDispach: dispacher.status === "started",
      });
    },
  };
};
