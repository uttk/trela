import { Dependency, Selector } from "../types";

export class DependencyClass implements Dependency {
  private bookUpdateIds: string[] = [];

  public readonly id: number;
  public didMount: boolean = false;
  public parents: Dependency[] = [];
  public selectors: Selector<any, any>[] = [];
  public updateComponentView: () => void;

  constructor(id: number, updateComponentView: () => void) {
    this.id = id;
    this.updateComponentView = updateComponentView;
  }

  private isParentUpdate(id: string): boolean {
    const parents = this.parents.concat();
    let len = parents.length;

    while (len > 0) {
      --len;

      if (parents[len].canUpdate(id)) {
        return true;
      }
    }

    return false;
  }

  isParent(dependency: Dependency): boolean {
    let len = this.parents.length;

    while (len > 0) {
      --len;

      if (dependency.id === this.parents[len].id) {
        return true;
      }
    }

    return false;
  }

  isListenState(state: any): boolean {
    let len = this.selectors.length;

    while (len > 0) {
      const [, isUpdate] = this.selectors[len](state);

      if (isUpdate) return true;

      --len;
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
}
