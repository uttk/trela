import { FlowManagerClass } from "@/elements/flowManager";
import { StoreClass } from "@/elements/store";
import { DependencyClass } from "@/elements/dependency";
import { FlowApi } from "@/index";

describe("Flow Manager Class", () => {
  const initState = { test: "test" };
  const apis = { test: async () => "test" };

  type StateType = typeof initState;
  type Apis = typeof apis;

  let store: StoreClass<StateType, Apis>;
  let flowMg: FlowManagerClass<StateType, Apis>;

  beforeEach(() => {
    store = new StoreClass({ apis, initState, reducer: (s) => s });
    flowMg = new FlowManagerClass(store, () => void 0);
  });

  describe("createId", () => {
    test("Return unique id", () => {
      const id = flowMg["createId"]("test");
      const id2 = flowMg["createId"]("test2");

      expect(id).not.toEqual(id2);
      expect(typeof id).toEqual("number");
      expect(typeof id2).toEqual("number");
    });
  });

  describe("returnFlowCache", () => {
    test("Return a flow when has not yet register the flow", () => {
      const factory = () => flowMg.createFlow("test", []);
      const flow = flowMg["returnFlowCache"](1, factory);
      const flow2 = flowMg["returnFlowCache"](1, factory);

      expect(flow).toEqual(flow2);
    });
  });

  describe("getFlow", () => {
    test("Return a flow that has the passed flowId", () => {
      const flow = flowMg.createFlow("test", []);

      expect(flowMg.getFlow(flow.id)).toEqual(flow);
    });
  });

  describe("createSeriesFlow", () => {
    test("Return a series flow", () => {
      const childFlow = flowMg.createFlow("test", []);
      const resultFlow = flowMg.createSeriesFlow([childFlow]);
      const ids = [...flowMg["flowIds"].entries()];

      ids.forEach(([key, id]) => {
        if (resultFlow.id === id) {
          expect(key).toContain("s:");
        } else {
          expect(childFlow.id).toEqual(id);
        }
      });
    });
  });

  describe("createParallelFlow", () => {
    test("Return a parallel flow", () => {
      const childFlow = flowMg.createFlow("test", []);
      const resultFlow = flowMg.createParallelFlow([childFlow]);
      const ids = [...flowMg["flowIds"].entries()];

      ids.forEach(([key, id]) => {
        if (resultFlow.id === id) {
          expect(key).toContain("p:");
        } else {
          expect(childFlow.id).toEqual(id);
        }
      });
    });
  });

  describe("createFlow", () => {
    test("Returns the flow that executes the api", () => {
      const flow = flowMg.createFlow("test", []);
      const apiMock = jest.fn(apis.test);

      apis.test = apiMock;

      flow.start();
      expect(apiMock).toBeCalledTimes(1);
      expect(flowMg.getFlow(flow.id)).toEqual(flow);
    });
  });

  describe("createFlowApi", () => {
    test("Return a flow api object", () => {
      const dependency = new DependencyClass(1, () => void 0);
      const flow = flowMg.createFlow("test", []);
      const flowApis = flowMg.createFlowApi(flow, dependency);
      const keys = Object.keys(flowApis);
      const requiredKeys: Array<keyof FlowApi<StateType>> = [
        "cancel",
        "error",
        "forceStart",
        "id",
        "once",
        "start",
      ];

      expect(flowApis).toBeInstanceOf(Object);
      expect(keys.sort()).toStrictEqual(requiredKeys.sort());
    });
  });
});
