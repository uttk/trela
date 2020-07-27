import { TrelaContextValue } from "@/type/index";
import { createContextValue } from "@/util/createContextValue";

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

    // does not include isDefault
    const expectKeys: Array<ContextKeys> = [
      "apis",
      "store",
      "utils",
      "flowMg",
      "dependencyMg",
    ];

    expect(keys.sort()).toStrictEqual(expectKeys.sort());
  });
});
