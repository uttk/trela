import { StreamerBaseClass } from "./StreamerBaseClass";
import { Store, Streamer } from "../../types";

export class SeriesStreamerClass<S> extends StreamerBaseClass<S> {
  private node: Streamer<S>[];
  private currentNode: null | Streamer<S> = null;
  private removeLietener?: () => void;

  constructor(node: Streamer<S>[], store: Store<S, any>) {
    super("s" + node.map((s) => s.id).join(""), store);

    this.node = node;
  }

  protected backStart() {
    if (this.status !== "started") return;

    if (this.removeLietener) {
      this.removeLietener();
    }

    const index = this.node.indexOf(this.currentNode as Streamer<S>);
    const node = this.node[index + 1] || null;

    this.currentNode = node;

    if (node) {
      this.removeLietener = node.addEventListener(
        "finished",
        this.backStart.bind(this)
      );

      node.forceStart();
    } else {
      this.finish();
    }
  }

  cancel(payload?: any) {
    if (this.status === "started") {
      this.changeStatus("cancel", payload);

      if (this.currentNode) {
        this.currentNode.cancel(payload);
        this.currentNode = null;
      }

      if (this.removeLietener) {
        this.removeLietener();
      }
    }
  }

  error(error: Error) {
    if (this.status === "started") {
      this.changeStatus("error", error);

      if (this.currentNode) {
        this.currentNode.error(error);
      }

      if (this.removeLietener) {
        this.removeLietener();
      }
    }
  }
}
