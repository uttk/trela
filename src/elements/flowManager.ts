import { FlowClass } from "./flow";
import { createApiRequest } from "../util/createApiRequest";
import { createSeriesRequest } from "../util/createSeriesRequest";
import { createParallelRequest } from "../util/createParallelRequest";
import {
  Flow,
  Store,
  Setup,
  FlowApi,
  ApisBase,
  Dependency,
  FlowManager,
} from "../type";

// eslint-disable-next-line prettier/prettier
export class FlowManagerClass<S, A extends ApisBase> implements FlowManager<S, A> {
  private store: Store<S, A>;
  private setup: Setup<S, A>;
  private flowIds: Map<string, number> = new Map();
  private flowCacheList: Map<Flow<S, A>["id"], Flow<S, A>> = new Map();

  // eslint-disable-next-line prettier/prettier
  constructor(store: Store<S, A>, setup: Setup<S, A>) {
    this.store = store;
    this.setup = setup;
  }

  private createId(key: string): number {
    const id = this.flowIds.get(key) || this.flowIds.size + 1;

    this.flowIds.set(key, id);

    return id;
  }

  private returnCache(
    flowId: Flow<S, A>["id"],
    createFlow: () => Flow<S, A>
  ): Flow<S, A> {
    const flow = this.flowCacheList.get(flowId) || createFlow();

    this.flowCacheList.set(flowId, flow);

    return flow;
  }

  createSeriesFlow(flowList: Flow<S, A>[]): Flow<S, A> {
    const id = this.createId("s:" + flowList.map((f) => f.id).join(""));

    return this.returnCache(id, () => {
      return new FlowClass(id, this.store, createSeriesRequest(flowList));
    });
  }

  createParallelFlow(flowList: Flow<S, A>[]): Flow<S, A> {
    const id = this.createId("p:" + flowList.map((f) => f.id).join(""));

    return this.returnCache(id, () => {
      return new FlowClass(id, this.store, createParallelRequest(flowList));
    });
  }

  // eslint-disable-next-line prettier/prettier
  createFlow<AK extends keyof A>(request: AK, payload: Parameters<A[AK]>): Flow<S, A> {
    const id = this.createId(JSON.stringify({ request, payload }));

    return this.returnCache(id, () => {
      return new FlowClass(id, this.store, createApiRequest(request, payload));
    });
  }

  createFlowApi(flow: Flow<S, A>, dependency: Dependency): FlowApi<S> {
    return {
      id: flow.id,

      once: () => {
        this.setup(flow, dependency);

        if (flow.status === "none") {
          flow.start();
        }

        return [flow.getStore().getState(), flow.status === "started"];
      },

      start: () => {
        this.setup(flow, dependency);

        if (flow.status !== "started") {
          flow.start();
        }
      },

      forceStart: () => {
        this.setup(flow, dependency);

        flow.cancel();
        flow.start();
      },

      cancel: () => {
        this.setup(flow, dependency);

        if (flow.status === "started") {
          flow.cancel();
        }
      },

      error: (payload: Error) => {
        this.setup(flow, dependency);

        if (flow.status === "started") {
          flow.error(payload);
        }
      },
    };
  }
}
