import { createWrapApis } from "../../src/utils/createWrapApis";
import { createContextValue } from "../../src/utils/createContextValue";
import { TrelaContextValue } from "../../src/types";
import { StreamerBaseClass } from "../../src/elements/streamers/StreamerBaseClass";

describe("createWrapApis function Tests", () => {
  const apisMock = {
    fetchUser: async () => "user",
    checkLogin: async () => false,
    testApi: async () => "NNN",
  };

  let contextValue: TrelaContextValue<any, typeof apisMock>;

  beforeEach(() => {
    contextValue = createContextValue({
      initState: 0,
      reducer: (s) => s,
      apis: apisMock,
    });
  });

  test("Returns the wrapped api", () => {
    const wrapApis = createWrapApis(() => {}, contextValue);

    expect(Object.keys(wrapApis).sort()).toStrictEqual(
      Object.keys(apisMock).sort()
    );
  });

  test("Wrapped Api returns Streamer instance", () => {
    const wrapApis = createWrapApis(() => {}, contextValue);

    Object.keys(apisMock).forEach((key) => {
      const k = key as keyof typeof apisMock;

      expect(wrapApis[k]()).toBeInstanceOf(StreamerBaseClass);
    });
  });
});
