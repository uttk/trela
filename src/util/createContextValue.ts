import { StoreClass } from "../elements/store";
import { FlowManagerClass } from "../elements/flowManager";
import { DependencyManagerClass } from "../elements/dependencyManager";
import { ApisBase, ContextOptions, TrelaContextValue, Setup } from "../type";

export const createContextValue = <S, A extends ApisBase>(
  options: ContextOptions<S, A>
): TrelaContextValue<S, A> => {
  const store = new StoreClass(options);
  const dependencyMg = new DependencyManagerClass();

  const setup: Setup<S, A> = (flow, dep) => {
    const flowId = flow.id;

    if (dep.hasFlowId(flowId)) return;

    dep.bookUpdate(flowId);

    flow.addEventCallback("started", () => {
      if (dep.didMount) {
        dep.updateComponentView();
      }
    });

    flow.addEventCallback("cancel", () => {
      dependencyMg.tryUpdateView(flowId);
    });

    flow.addEventCallback("finished", () => {
      dependencyMg.tryUpdateView(flowId);
    });
  };

  return {
    store,
    dependencyMg,
    flowMg: new FlowManagerClass(store, setup),
  };
};
