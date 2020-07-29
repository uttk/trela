import {
  render,
  waitFor,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import * as React from "react";
import {
  useTrela,
  TrelaProvider,
  TrelaContextValue,
  createContextValue,
} from "../../src/index";
import {
  apis,
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
    const [{ users }, isLoading] = fetchUsers().once();

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
        <button onClick={() => fetchUsers().start()}>Refetch</button>
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

  test("Can be displayed Loading Status", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Loading"));
  });

  test("Keep the display count to a minimum", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Loading"));

    expect(mountCounter).toHaveBeenCalledTimes(2);
  });

  test("Can cancel the fetchUsers action", async () => {
    const { getByText, queryByText, queryAllByText } = render(<Root />);
    const cancelButton = getByText("Cancel");

    expect(queryByText("Loading")).not.toBeNull();

    fireEvent.click(cancelButton);

    await waitFor(() => expect(queryByText("Loading")).toBeNull());

    expect(mountCounter).toBeCalledTimes(2);
    expect(queryAllByText(/^Example/)).toHaveLength(0);
  });

  test("Can refetch users", async () => {
    const { getByText, queryByText, queryAllByText } = render(<Root />);

    expect(queryAllByText(/^Example/)).toHaveLength(0);

    await waitForElementToBeRemoved(() => queryByText("Loading"));
    expect(queryAllByText(/^Example/)).toHaveLength(
      responseMockData.users.length
    );

    const refetchButton = getByText("Refetch");

    fireEvent.click(refetchButton);

    await waitForElementToBeRemoved(() => queryByText("Loading"));
    expect(queryAllByText(/^Example/)).toHaveLength(
      responseMockData.users.length
    );

    expect(mountCounter).toBeCalledTimes(4);
  });
});
