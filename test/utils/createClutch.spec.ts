import { createContextValue } from "../../src/utils/createContextValue";

describe("createClutch Function Test", () => {
  test("Return to clutch context value", () => {
    const value = createContextValue({
      initState: 0,
      reducer: (state) => state,
    });

    expect(Object.keys(value).sort()).toEqual(
      ["store", "streamerMg", "dependencyMg"].sort()
    );
  });
});
