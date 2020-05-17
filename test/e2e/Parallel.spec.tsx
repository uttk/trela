import * as React from "react";
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { useTrela } from "../../src/hooks/useTrela";
import { createContextValue } from "../../src/utils/createContextValue";
import { TrelaProvider } from "../../src/components/TrelaProvider";
import { TrelaContextValue } from "../../src/types";
import {
  apis,
  reducer,
  ApisType,
  initState,
  StateType,
  responseMockData,
} from "./utils";

describe("Parallel Use Case", () => {
  let contextValue: TrelaContextValue<any, any>;
  let mountCounter: jest.Mock<any, any>;

  beforeEach(() => {
    mountCounter = jest.fn();
    contextValue = createContextValue({ apis, reducer, initState });
  });

  const App = () => {
    const { all, apis } = useTrela<StateType, ApisType>();
    const { checkLogin, fetchUsers } = apis;

    const ref = all([checkLogin(), fetchUsers()]);

    const [{ isLogin, users }, isLoading] = ref.start((state) => state);

    mountCounter();

    return (
      <div>
        {isLoading ? <p>Loading</p> : null}

        <p>{isLogin ? "Logged in" : "Not logged in yet"}</p>

        <h1>Users</h1>

        <ul>
          {users.map((user) => (
            <li key={`user-list-${user.id}`}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  const Root = () => (
    <TrelaProvider value={contextValue}>
      <App />
    </TrelaProvider>
  );

  test("Can be displayed Login Status", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Loading"));
  });

  test("Keep the display count to a minimum", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Loading"));

    await waitFor(() => expect(mountCounter).toHaveBeenCalledTimes(2));
  });

  test("The fetched element is displayed", async () => {
    const { getByText, getAllByText } = render(<Root />);

    await waitFor(() => expect(getByText("Logged in")).toBeDefined());

    await waitFor(() => {
      expect(getAllByText(/^Example/)).toHaveLength(
        responseMockData.users.length
      );
    });
  });
});
