import { Dependency } from "../types";

export class DependencyClass implements Dependency {
  private updateComponentView: () => void;
  private bookUpdateIds: string[] = [];

  public id: number;
  public didMount: boolean = false;
  public parents: Dependency[] = [];

  constructor(id: number, updateComponentView: () => void) {
    this.id = id;
    this.updateComponentView = updateComponentView;
  }

  private isParentUpdate(id: string): boolean {
    const parents = this.parents.concat();
    let len = parents.length;

    while (len--) {
      if (parents[len].canUpdate(id)) {
        return true;
      }
    }

    return false;
  }

  canUpdate(id: string) {
    if (!this.didMount) {
      return false;
    }

    const hasId = this.bookUpdateIds.find((v) => v === id);

    return Boolean(hasId) && !this.isParentUpdate(id);
  }

  bookUpdate(id: string) {
    this.bookUpdateIds = this.bookUpdateIds.concat(id);
  }

  tryUpdateView(id: string) {
    if (this.canUpdate(id)) {
      this.updateComponentView();
    }

    this.bookUpdateIds = this.bookUpdateIds.filter((v) => v !== id);
  }

  forceUpdate() {
    this.updateComponentView();
  }

  setParents(parents: Dependency[]) {
    this.parents = parents.concat();
  }

  setMount(mount: boolean) {
    this.didMount = mount;
  }
}
