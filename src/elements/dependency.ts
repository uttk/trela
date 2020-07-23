import { Dependency, Selector } from "../type";

export class DependencyClass implements Dependency {
  private bookingUpdateIds: Array<number> = [];

  readonly id: Dependency["id"];
  readonly updateComponentView: () => void;

  didMount: boolean = false;
  selectors: Set<Selector<any, any>> = new Set();
  parents: Map<Dependency["id"], Dependency> = new Map();

  constructor(id: Dependency["id"], updateComponentView: () => void) {
    this.id = id;
    this.updateComponentView = updateComponentView;
  }

  init(): void {
    this.didMount = false;
    this.selectors.clear();
  }

  bookUpdate(id: number): void {
    this.bookingUpdateIds.push(id);
  }

  updateParents(parents: Map<Dependency["id"], Dependency>): void {
    this.parents = parents;
  }
}
