import {
  render,
  waitFor,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import * as React from "react";
import { apis, ApisType, responseMockData } from "./utils";
import { TrelaContext, createTrelaContext } from "@/index";

describe("Parallel Use Case", () => {
  let Context: TrelaContext<ApisType>;
  let mountCounter: jest.Mock<any, any>;

  beforeEach(() => {
    mountCounter = jest.fn();
    Context = createTrelaContext({ apis });
  });

  const App = () => {
    const { all, apis } = Context.useTrela();
    const { checkLogin, fetchUsers } = apis;

    const ref = all([checkLogin(), fetchUsers()]);

    const [[isLogin, users], isLoading] = ref.default([false, []]).read();

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
        <button onClick={() => ref.start()}>Refetch</button>
      </div>
    );
  };

  const Root = () => (
    <Context.Provider>
      <App />
    </Context.Provider>
  );

  test("Can be displayed Loading Status", async () => {
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
    const { getByText, getAllByText, queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Loading"));

    const refetchButton = getByText("Refetch");

    fireEvent.click(refetchButton);

    await waitForElementToBeRemoved(() => queryByText("Loading"));
    await waitFor(() =>
      expect(getAllByText(/^Example/)).toHaveLength(
        responseMockData.users.length
      )
    );

    expect(mountCounter).toBeCalledTimes(4);
  });
});
