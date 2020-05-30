import { createWrapApis } from "../../src/utils/createWrapApis";
import { DependencyClass } from "../../src/elements/DependencyClass";
import { createContextValue } from "../../src/utils/createContextValue";
import { TrelaContextValue } from "../../src/types";
import { StreamerBaseClass } from "../../src/elements/streamers/StreamerBaseClass";

describe("createWrapApis function Tests", () => {
  const apisMock = {
    fetchUser: async () => "user",
    checkLogin: async () => false,
    testApi: async () => "NNN",
  };

  let updateMock: jest.Mock;
  let dependency: DependencyClass;
  let contextValue: TrelaContextValue<any, typeof apisMock>;

  beforeEach(() => {
    contextValue = createContextValue({
      initState: 0,
      reducer: (s) => s,
      apis: apisMock,
    });
    updateMock = jest.fn();
    dependency = new DependencyClass(0, updateMock);
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
