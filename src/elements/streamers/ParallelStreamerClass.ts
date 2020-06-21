import { StreamerBaseClass } from "./StreamerBaseClass";
import { Streamer, Store } from "../../types";

export class ParallelStreamerClass<S> extends StreamerBaseClass<S> {
  private node: Streamer<S>[];
  private removeListeners: Array<() => void> = [];

  constructor(node: Streamer<S>[], store: Store<S, any>) {
    super("p" + node.map((s) => s.id).join(""), store);

    this.node = node;
  }

  private clearListeners() {
    this.removeListeners.forEach((cb) => cb());
    this.removeListeners = [];
  }

  protected backStart() {
    if (this.status !== "started") return;

    this.clearListeners();

    let counter = 0;
    const max = this.node.length;
    const onComplite = () => ++counter === max && this.finish();

    this.node.forEach((streamer) => {
      const removeListeners = [
        streamer.addEventListener("finished", onComplite),
        streamer.addEventListener("cancel", this.cancel.bind(this)),
        streamer.addEventListener("error", this.error.bind(this)),
      ];

      this.removeListeners.push(...removeListeners);

      streamer.start();
    });
  }

  cancel(payload?: any) {
    if (this.status === "started") {
      this.changeStatus("cancel", payload);
      this.node.forEach((streamer) => streamer.cancel(payload));
      this.clearListeners();
    }
  }

  error(error: Error) {
    if (this.status === "started") {
      this.changeStatus("error", error);
      this.node.forEach((streamer) => streamer.error(error));
      this.clearListeners();
    }
  }
}
