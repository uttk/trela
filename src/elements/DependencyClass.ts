import { Dependency, Streamer } from "../types";

export class DependencyClass implements Dependency {
  private updateComponentView: () => void;
  private streamerList: Map<
    string,
    { streamer: Streamer<any>; removeListener: () => void }
  > = new Map();

  public id: number = NaN;
  public didMount: boolean = false;
  public parents: Dependency[] = [];
  public isUpdateStack: boolean = false;

  constructor(id: number, updateComponentView: () => void) {
    this.id = id;
    this.updateComponentView = updateComponentView;
  }

  private tryUpdateView() {
    if (!this.didMount) {
      this.isUpdateStack = true;
    } else {
      this.updateComponentView();
    }
  }

  private isParentUpdate(streamer: Streamer<any>): boolean {
    const isUpdates = this.parents
      .map((parent) => parent.canUpdate(streamer))
      .filter((v) => v);

    return isUpdates.length > 0;
  }

  popUpdate() {
    if (this.isUpdateStack && this.didMount) {
      this.isUpdateStack = false;
      this.updateComponentView();
    }
  }

  addStreamer(streamer: Streamer<any>) {
    if (this.streamerList.has(streamer.id)) return;

    const removeListener = streamer.addEventListener("finished", () => {
      if (this.canUpdate(streamer)) {
        this.tryUpdateView();
      }
    });

    this.streamerList.set(streamer.id, { streamer, removeListener });
  }

  deleteStreamer(id: Streamer<any>["id"]) {
    const cache = this.streamerList.get(id);

    if (cache) {
      cache.removeListener();
      this.streamerList.delete(id);
    }
  }

  canUpdate(streamer: Streamer<any>): boolean {
    if (this.isParentUpdate(streamer)) {
      return false;
    } else {
      return this.streamerList.has(streamer.id);
    }
  }

  setParents(parents: Dependency[]) {
    this.parents = parents.concat();
  }

  setMount(mount: boolean) {
    this.didMount = mount;
  }
}
