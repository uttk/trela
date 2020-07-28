import { Flow, Store, ApisBase, FlowManager, FlowRequest } from "../type";
import { FlowClass } from "./flow";

// eslint-disable-next-line prettier/prettier
export class FlowManagerClass<S, A extends ApisBase> implements FlowManager<S, A> {
  private store: Store<S, A>;
  private flowIds: Map<string, number> = new Map();
  private flowCacheList: Map<Flow<S, A>["id"], Flow<S, A>> = new Map();

  constructor(store: Store<S, A>) {
    this.store = store;
  }

  private returnFlowCache(flow: Flow<S, A>): Flow<S, A> {
    const returnValue = this.flowCacheList.get(flow.id) || flow;

    this.flowCacheList.set(returnValue.id, returnValue);

    return returnValue;
  }

  createId(key: string): number {
    const id = this.flowIds.get(key) || this.flowIds.size + 1;

    this.flowIds.set(key, id);

    return id;
  }

  getFlow(flowId: number): void | Flow<S, A> {
    return this.flowCacheList.get(flowId);
  }

  createFlow(id: number, request: FlowRequest<S, A>): Flow<S, A> {
    return this.returnFlowCache(new FlowClass(id, this.store, request));
  }
}
