import { Dispach, Dispacher, FlowStatus, CreateDispach } from "../types";

export const createDispacher = (
  id: string,
  createDispach: CreateDispach<any, any>
): Dispacher => {
  const compliteCallbacks: Set<() => void> = new Set();
  let currentStatus: FlowStatus = "none";

  const dispacher: Dispacher = {
    id,

    status: currentStatus,

    dispatch: (context, request) => {
      const dispach = createDispach(context, [...compliteCallbacks]);

      if (request.canDispach) {
        currentStatus = request.status;
        dispach(request);
      }
    },

    onComplite: (callback) => {
      compliteCallbacks.add(callback);

      return () => compliteCallbacks.delete(callback);
    },
  };

  return dispacher;
};
