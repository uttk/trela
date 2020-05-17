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
import { apis, reducer, initState, StateType, ApisType } from "./utils";

describe("Component Dependency Use Case", () => {
  let contextValue: TrelaContextValue<any, any>;
  let mountCounter: jest.Mock<any, any>;
  let childMountCounter: jest.Mock<any, any>;

  beforeEach(() => {
    mountCounter = jest.fn();
    childMountCounter = jest.fn();
    contextValue = createContextValue({ apis, reducer, initState });
  });

  const UserList = () => {
    const { steps, apis } = useTrela<StateType, ApisType>();
    const { checkLogin, fetchUsers } = apis;
    const ref = steps([checkLogin(), fetchUsers()]);
    const [users, isLoading] = ref.start((state) => state.users);

    childMountCounter();

    return (
      <div>
        {isLoading ? <p>Child Loading</p> : null}

        <ul>
          {users.map((user, i) => (
            <li key={`user-list-${i}`}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  const App = () => {
    const { steps, apis } = useTrela<StateType, ApisType>();
    const { checkLogin, fetchUsers } = apis;
    const ref = steps([checkLogin(), fetchUsers()]);
    const [{ isLogin, users }, isLoading] = ref.start((state) => state);

    mountCounter();

    return (
      <div>
        {isLoading ? <p>App Loading</p> : null}

        <p>{isLogin ? "Logged in" : "Not logged in yet"}</p>

        <p>User Count : {users.length}</p>

        <UserList />
      </div>
    );
  };

  const Root = () => (
    <TrelaProvider value={contextValue}>
      <App />
    </TrelaProvider>
  );

  test("Keep the App component display count to a minimum", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("App Loading"), {
      timeout: 3000,
    });

    await waitFor(() => expect(mountCounter).toHaveBeenCalledTimes(2));
  });

  test("Keep the Child component display count to a minimum", async () => {
    const { queryByText } = render(<Root />);

    await waitForElementToBeRemoved(() => queryByText("Child Loading"), {
      timeout: 3000,
    });

    await waitFor(() => expect(mountCounter).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(childMountCounter).toHaveBeenCalledTimes(2));
  });
});
