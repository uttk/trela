import { Flow, Dependency, ApisBase, DependencyManager } from "../type";

export const createSetup = <S, A extends ApisBase>(
  dependencyMg: DependencyManager<S>
) => (flow: Flow<S, A>, dep: Dependency<S>) => {
  if (dep.hasFlowId(flow.id)) return;

  dep.bookUpdate(flow.id);

  flow.addEventListener("started", () => {
    if (dep.didMount) {
      dep.updateComponentView();
    }
  });

  dependencyMg.listenFlow(flow);
};
