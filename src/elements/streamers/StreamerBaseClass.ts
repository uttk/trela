import { Store, Streamer, StreamerStatus } from "../../types";

export class StreamerBaseClass<S> implements Streamer<S> {
  protected status: StreamerStatus = "none";
  protected store: Store<S, any>;
  protected eventCallbacks: Map<
    string,
    Array<(payload?: any) => void>
  > = new Map();

  public readonly id: string;

  constructor(id: string, store: Store<S, any>) {
    this.id = id;
    this.store = store;
  }

  protected changeStatus(status: StreamerStatus, payload?: any) {
    if (this.status === status) return;

    this.status = status;

    const callbacks = this.eventCallbacks.get(status);

    if (callbacks) {
      callbacks.forEach((cb) => cb(payload));
    }
  }

  protected backStart() {}

  addEventListener(
    event: StreamerStatus,
    callback: (payload?: any) => void
  ): () => void {
    const callbacks = this.eventCallbacks.get(event) || [];

    this.eventCallbacks.set(event, callbacks.concat(callback));

    return () => {
      const all = this.eventCallbacks.get(event) || [];

      this.eventCallbacks.set(
        event,
        all.filter((v) => v !== callback)
      );
    };
  }

  finish(payload?: any) {
    if (this.status === "started") {
      this.changeStatus("finished", payload);
    }
  }

  cancel(payload?: any) {
    if (this.status === "started") {
      this.changeStatus("cancel", payload);
    }
  }

  error(error: Error) {
    if (this.status === "started") {
      this.changeStatus("error", error);
    }
  }

  forceStart(cancel?: boolean, payload?: any) {
    if (cancel) {
      this.cancel(payload);
    }

    this.changeStatus("started");
    this.backStart();
  }

  start() {
    if (this.status !== "started") {
      this.changeStatus("started");
      this.backStart();
    }
  }

  once(): [S, boolean] {
    if (this.status === "none") {
      this.changeStatus("started");
      this.backStart();
    }

    return [this.store.getState(), this.status === "started"];
  }
}
