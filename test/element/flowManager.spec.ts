import { FlowClass } from "@/elements/flow";
import { FlowManagerClass } from "@/elements/flowManager";
import { StoreClass } from "@/elements/store";

describe("Flow Manager Class", () => {
  const initState = { test: "test" };
  const apis = { test: async () => "test" };

  type StateType = typeof initState;
  type Apis = typeof apis;

  let store: StoreClass<StateType, Apis>;
  let flowMg: FlowManagerClass<StateType, Apis>;

  beforeEach(() => {
    store = new StoreClass({ apis, initState, reducer: (s) => s });
    flowMg = new FlowManagerClass(store);
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
      const baseFlow = new FlowClass<StateType, Apis>(1, store, () => {});
      const sameIdFlow = new FlowClass<StateType, Apis>(1, store, () => {});

      const flow = flowMg["returnFlowCache"](baseFlow);
      const flow2 = flowMg["returnFlowCache"](sameIdFlow);

      expect(flow).toEqual(flow2);
    });
  });

  describe("getFlow", () => {
    test("Return a flow that has the passed flowId", () => {
      const flow = flowMg.createFlow(1, () => {});

      expect(flowMg.getFlow(flow.id)).toEqual(flow);
    });
  });

  describe("createFlow", () => {
    test("Returns the flow", () => {
      const flow = flowMg.createFlow(1, () => {});

      expect(flow).toBeInstanceOf(FlowClass);
      expect(flowMg.getFlow(flow.id)).toEqual(flow);
    });
  });
});
