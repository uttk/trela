import * as React from "react";
import { render } from "@testing-library/react";

import {
  TrelaProvider,
  TrelaContextValue,
  createContextValue,
} from "../../src/index";

describe("<ClutchProvider />", () => {
  let contextValue: TrelaContextValue<any, any>;

  beforeEach(() => {
    contextValue = createContextValue({
      apis: {},
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
