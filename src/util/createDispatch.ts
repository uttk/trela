import { requestFlow } from "../elements/flow";
import {
  addUpdateRelation,
  tryUpdateComponentView,
} from "../elements/relation";
import { FlowDispatch, TrelaDispatchContext } from "../type";

export const createDispatch = (context: TrelaDispatchContext): FlowDispatch => {
  const { flowStore, relationStore } = context;

  return (request) => {
    const { id: flowId, action, fromDependency } = request;

    if (fromDependency !== null) {
      addUpdateRelation(relationStore, flowId, fromDependency);
    }

    const flow = requestFlow(flowStore, request, () => {
      tryUpdateComponentView(relationStore, flowId);
    });

    if (action === "start" && fromDependency !== null) {
      tryUpdateComponentView(relationStore, flowId);
    }

    return flow;
  };
};
