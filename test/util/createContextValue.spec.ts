import { createContextValue } from "@/util/createContextValue";
import { TrelaContextValue } from "@/type/index";

type ContextKeys = keyof TrelaContextValue<any, any>;

describe("createContextValue", () => {
  let contextValue: TrelaContextValue<{}, {}>;

  beforeEach(() => {
    contextValue = createContextValue({
      apis: {},
      initState: {},
      reducer: (s) => s,
    });
  });

  test("Return a context value", () => {
    expect(contextValue).toBeInstanceOf(Object);
  });

  test("The returned ContextValue has required information", () => {
    const keys = Object.keys(contextValue);
    const expectKeys: Array<ContextKeys> = ["store", "flowMg", "dependencyMg"];

    expect(keys.sort()).toStrictEqual(expectKeys.sort());
  });
});
