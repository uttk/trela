import * as React from "react";
import { render } from "@testing-library/react";

import { createContextValue } from "../../src/utils/createContextValue";
import { TrelaProvider } from "../../src/components/TrelaProvider";
import { TrelaContextValue } from "../../src/types";

describe("<ClutchProvider />", () => {
  let contextValue: TrelaContextValue<any, any>;

  beforeEach(() => {
    contextValue = createContextValue({
      initState: 0,
      reducer: (state) => state,
    });
  });

  test("Display Children Components", () => {
    const { getByText } = render(
      <TrelaProvider value={contextValue}>
        <p>Hello World!</p>
      </TrelaProvider>
    );

    const element = getByText("Hello World!");

    expect(element).toBeDefined();
    expect(element.innerHTML).toBe("Hello World!");
  });
});
