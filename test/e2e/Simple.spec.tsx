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

describe("Simple Use Case", () => {
  let contextValue: TrelaContextValue<any, any>;
  let mountCounter: jest.Mock<any, any>;

  beforeEach(() => {
    mountCounter = jest.fn();
    contextValue = createContextValue({ apis, reducer, initState });
  });

  const App = () => {
    const { apis } = useTrela<StateType, ApisType>();
    const { fetchUsers } = apis;
    const [{ users }, isLoading] = fetchUsers().start();

    mountCounter();

    return (
      <div>
        {isLoading ? <p>Loading</p> : null}

        <h1>Users</h1>

        <ul>
          {users.map((user, i) => (
            <li key={`user-${i}`}>{user.name}</li>
          ))}
        </ul>

        <button onClick={() => fetchUsers().cancel()}>Cancel</button>
        <button onClick={() => fetchUsers().forceStart()}>Refetch</button>
      </div>
    );
  };

  const Root = () => (
    <TrelaProvider value={contextValue}>
      <App />
    </TrelaProvider>
  );

  test("Display User List", async () => {
    const { getAllByText } = render(<Root />);

    await waitFor(() =>
      expect(getAllByText(/^Example/)).toHaveLength(
        responseMockData.users.length
      )
    );
  });

  test("Can be displayed Login Status", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Loading"));
  });

  test("Keep the display count to a minimum", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Loading"));

    expect(mountCounter).toHaveBeenCalledTimes(2);
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

    await waitForElementToBeRemoved(() => queryByText("Loading"));

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
