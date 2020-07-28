import { DependencyManagerClass } from "@/elements/dependencyManager";
import { FlowClass } from "@/elements/flow";
import { StoreClass } from "@/elements/store";
import { createSetup } from "@/util/createSetup";

describe("createSetup", () => {
  let store: StoreClass<any, any>;
  let dependencyMg: DependencyManagerClass<any>;

  beforeEach(() => {
    store = new StoreClass({ apis: {}, initState: {}, reducer: (s) => s });
    dependencyMg = new DependencyManagerClass();
  });

  test("Returns the Setup function", () => {
    const setup = createSetup(dependencyMg);

    expect(typeof setup).toBe("function");
  });

  test("Execute bookUpdate when passed Dependency does not have passed Flow Id", () => {
    const flow = new FlowClass(1, store, () => void 0);
    const dep = dependencyMg.createDependency(() => void 0);
    const setup = createSetup(dependencyMg);
    const bookUpdateMock = jest.fn(dep.bookUpdate);

    dep.bookUpdate = bookUpdateMock;

    setup(flow, dep);
    expect(bookUpdateMock).toBeCalledTimes(1);

    setup(flow, dep);
    expect(bookUpdateMock).toBeCalledTimes(1);
    expect(dep.hasFlowId(flow.id)).toBeTruthy();
  });
});
