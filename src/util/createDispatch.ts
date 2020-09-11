import { requestFlow, returnFlow } from "../elements/flow";
import {
  addUpdateRelation,
  tryUpdateComponentView,
} from "../elements/relation";
import { FlowDispatch, TrelaDispatchContext } from "../type";

export const createDispatch = (context: TrelaDispatchContext): FlowDispatch => {
  const { flowStore, relationStore } = context;
  const { flows } = flowStore;

  return (request) => {
    const { id: flowId, action, fromDependency } = request;

    if (fromDependency !== null) {
      addUpdateRelation(relationStore, flowId, fromDependency);
    }

    const flow = requestFlow(
      returnFlow(flowStore, request),
      request,
      (result) => {
        flows.set(flowId, {
          ...flow,
          result,
          isProgress: false,
          promise: null,
        });

        tryUpdateComponentView(relationStore, flowId);
      }
    );

    flows.set(flowId, flow);

    if (action === "start" && fromDependency !== null) {
      tryUpdateComponentView(relationStore, flowId);
    }

    return flow;
  };
};
