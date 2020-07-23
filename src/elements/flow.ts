import { EmptyError } from "./emptyError";
import { Flow, Store, ApisBase, FlowStatus, FlowRequest } from "../type";

export class FlowClass<S, A extends ApisBase> implements Flow<S, A> {
  protected store: Store<S, A>;
  protected request: FlowRequest<S, A>;
  protected callbacks = new Map<FlowStatus, Set<() => void>>();

  readonly id: number;
  status: FlowStatus = "none";
  currentError: Error = new EmptyError();

  constructor(id: number, store: Store<S, A>, request: FlowRequest<S, A>) {
    this.id = id;
    this.store = store;
    this.request = request;
  }

  protected changeStatus<FS extends FlowStatus>(status: FS) {
    if (this.status === status) return;

    this.status = status;
    const callbacks = this.callbacks.get(status);

    if (callbacks) callbacks.forEach((f) => f());
  }

  getStore(): Store<S, A> {
    return this.store;
  }

  addEventCallback(type: FlowStatus, callback: () => void) {
    const callbacks = this.callbacks.get(type) || new Set();

    callbacks.add(callback);

    return () => callbacks.delete(callback);
  }

  once = () => {
    if (this.status !== "none") return;

    this.changeStatus("started");
    this.request(this);
  };

  start = () => {
    if (this.status === "started") return;

    this.changeStatus("started");
    this.request(this);
  };

  forceStart = () => {
    this.cancel();
    this.start();
  };

  cancel = () => {
    if (this.status !== "started") return;

    this.changeStatus("cancel");
  };

  error = (payload: Error) => {
    if (this.status !== "started") return;

    this.currentError = payload;
    this.changeStatus("error");
  };

  complete = () => {
    if (this.status !== "started") return;

    this.changeStatus("finished");
  };
}
