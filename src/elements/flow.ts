import { Flow, Store, ApisBase, FlowStatus, FlowRequest } from "../type";
import { EmptyError } from "./emptyError";

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

  addEventListener(type: FlowStatus, callback: () => void) {
    const callbacks = this.callbacks.get(type) || new Set();

    this.callbacks.set(type, callbacks.add(callback));

    return () => callbacks.delete(callback);
  }

  start = () => {
    this.changeStatus("started");
    this.request(this);
  };

  cancel = () => {
    this.changeStatus("cancel");
  };

  error = (payload?: Error) => {
    this.currentError = payload || this.currentError;
    this.changeStatus("error");
  };

  complete = () => {
    this.changeStatus("finished");
  };
}
