import { Flow, Selector, Dependency } from "../type";

export class DependencyClass<S> implements Dependency<S> {
  private bookingFlowIds: Array<Flow<any, any>["id"]> = [];

  readonly id: Dependency<S>["id"];
  readonly updateComponentView: () => void;

  didMount: boolean = false;
  selectors: Set<Selector<any, any>> = new Set();
  parents: Map<Dependency<S>["id"], Dependency<S>> = new Map();

  constructor(id: Dependency<S>["id"], updateComponentView: () => void) {
    this.id = id;
    this.updateComponentView = updateComponentView;
  }

  init(): void {
    this.didMount = false;
    this.selectors.clear();
  }

  bookUpdate(id: number): void {
    this.bookingFlowIds.push(id);
  }

  updateParents(parents: Map<Dependency<S>["id"], Dependency<S>>): void {
    this.parents = parents;
  }

  isParent(dependencyId: Dependency<S>["id"]): boolean {
    return this.parents.has(dependencyId);
  }

  hasFlowId(flowId: Flow<any, any>["id"]): boolean {
    return this.bookingFlowIds.indexOf(flowId) !== -1;
  }

  canUpdate(flowId: Flow<any, any>["id"]): boolean {
    if (!this.didMount) return false;
    if (!this.hasFlowId(flowId)) return false;

    return [...this.parents.values()].reduce<boolean>((pre, dep) => {
      return pre ? !dep.canUpdate(flowId) : false;
    }, true);
  }

  isListenState(state: any): boolean {
    return [...this.selectors.values()].reduce<boolean>((bool, selector) => {
      return bool ? bool : !!selector(state)[1];
    }, false);
  }
}
