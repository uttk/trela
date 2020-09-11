import {
  render,
  waitFor,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import * as React from "react";
import { TrelaContext, createTrelaContext } from "../../src/index";
import { apis, ApisType, responseMockData } from "./utils";

describe("Component Dependency Use Case", () => {
  let Context: TrelaContext<ApisType>;
  let mountCounter: jest.Mock<any, any>;
  let childMountCounter: jest.Mock<any, any>;

  beforeEach(() => {
    mountCounter = jest.fn();
    childMountCounter = jest.fn();
    Context = createTrelaContext({ apis });
  });

  const UserList = () => {
    const { steps, apis } = Context.useTrela();
    const { checkLogin, fetchUsers } = apis;
    const ref = steps([checkLogin(), fetchUsers()]);
    const [[, users], isLoading] = ref.default([false, []]).read();

    childMountCounter();

    return (
      <div>
        {isLoading ? <p>Child Loading</p> : null}

        <ul>
          {users?.map((user, i) => (
            <li key={`user-list-${i}`}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  const App = () => {
    const { steps, apis } = Context.useTrela();
    const { checkLogin, fetchUsers } = apis;
    const ref = steps([checkLogin(), fetchUsers()]);
    const [[isLogin, users], isLoading] = ref.default([false, []]).read();

    mountCounter();

    return (
      <div>
        {isLoading ? <p>App Loading</p> : null}

        <p>{isLogin ? "Logged in" : "Not logged in yet"}</p>

        <p>User Count : {users?.length || 0}</p>

        <UserList />

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

  test("Keep the App component display count to a minimum", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("App Loading"));

    await waitFor(() => expect(mountCounter).toHaveBeenCalledTimes(2));
  });

  test("Keep the Child component display count to a minimum", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Child Loading"));

    await waitFor(() => expect(mountCounter).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(childMountCounter).toHaveBeenCalledTimes(2));
  });

  test("Can cancel the fetchUsers action", async () => {
    const { getByText, queryByText, queryAllByText } = render(<Root />);
    const cancelButton = getByText("Cancel");

    expect(queryByText("App Loading")).not.toBeNull();

    fireEvent.click(cancelButton);

    await waitFor(() => expect(queryByText("App Loading")).toBeNull());

    expect(queryByText("Child Loading")).toBe(null);
    expect(queryAllByText(/^Example/)).toHaveLength(0);
  });

  test("Can refetch users", async () => {
    const { getByText, queryAllByText, queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("App Loading"));
    expect(queryByText("Child Loading")).toBeNull();

    const refetchButton = getByText("Refetch");

    fireEvent.click(refetchButton);

    await waitForElementToBeRemoved(() => queryByText("App Loading"));
    expect(queryByText("Child Loading")).toBeNull();

    await waitFor(() =>
      expect(queryAllByText(/^Example/)).toHaveLength(
        responseMockData.users.length
      )
    );

    expect(mountCounter).toBeCalledTimes(4);
  });
});
