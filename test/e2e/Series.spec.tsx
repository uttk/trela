import * as React from "react";
import {
  render,
  waitFor,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { useTrela } from "../../src/hooks/useTrela";
import { createContextValue } from "../../src/utils/createContextValue";
import { TrelaProvider } from "../../src/components/TrelaProvider";
import { TrelaContextValue } from "../../src/types";
import {
  apis,
  sleep,
  reducer,
  ApisType,
  initState,
  StateType,
  responseMockData,
} from "./utils";

describe("Series Use Case", () => {
  const timeout = { timeout: 1000 };

  let contextValue: TrelaContextValue<any, any>;
  let mountCounter: jest.Mock<any, any>;

  beforeEach(() => {
    mountCounter = jest.fn();
    contextValue = createContextValue({ apis, reducer, initState });
  });

  const App = () => {
    const { steps, apis } = useTrela<StateType, ApisType>();
    const { checkLogin, fetchUsers } = apis;
    const ref = steps([checkLogin(), fetchUsers()]);

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

        <button onClick={() => ref.cancel()}>Cancel</button>
        <button onClick={() => ref.forceStart()}>Refetch</button>
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

    await waitForElementToBeRemoved(() => queryByText("Loading"), timeout);
  });

  test("Keep the display count to a minimum", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Loading"), timeout);

    await waitFor(() => expect(mountCounter).toHaveBeenCalledTimes(2));
  });

  test("The fetched element is displayed", async () => {
    const { getByText, getAllByText } = render(<Root />);

    await waitFor(() => expect(getByText("Logged in")).toBeDefined(), timeout);

    await waitFor(() => {
      expect(getAllByText(/^Example/)).toHaveLength(
        responseMockData.users.length
      );
    }, timeout);
  });

  test("Can cancel the fetchUsers action", async () => {
    const { getByText, queryAllByText } = render(<Root />);
    const cancelButton = getByText("Cancel");

    fireEvent.click(cancelButton);

    await sleep(1000);

    expect(getByText("Loading")).toBeDefined();
    expect(queryAllByText(/^Example/)).toHaveLength(0);
  });

  test("Can refetch users", async () => {
    const { getByText, getAllByText, queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Loading"), timeout);

    const refetchButotn = getByText("Refetch");

    fireEvent.click(refetchButotn);

    await waitForElementToBeRemoved(() => queryByText("Loading"));
    await waitFor(() =>
      expect(getAllByText(/^Example/)).toHaveLength(
        responseMockData.users.length
      )
    );

    expect(mountCounter).toBeCalledTimes(4);
  });
});
