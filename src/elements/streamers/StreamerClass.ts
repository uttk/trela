import { StreamerBaseClass } from "./StreamerBaseClass";
import { Store, Stream } from "../../types";

export class StreamerClass<S> extends StreamerBaseClass<S> {
  private stream: Stream;
  private removeCompliteCallback?: () => void;

  constructor(stream: Stream, store: Store<S, any>) {
    super(stream.id, store);

    this.stream = stream;
  }

  protected backStart() {
    if (this.status !== "started") return;

    if (this.removeCompliteCallback) {
      this.removeCompliteCallback();
    }

    this.removeCompliteCallback = this.stream.onComplite(
      this.finish.bind(this)
    );

    this.stream.send("request");
  }

  cancel(payload?: any) {
    if (this.status === "started") {
      this.changeStatus("cancel", payload);
      this.stream.send("cancel", payload);
    }
  }

  error(error: Error) {
    if (this.status === "started") {
      this.changeStatus("error", error);
      this.stream.send("error", error);
    }
  }
}
