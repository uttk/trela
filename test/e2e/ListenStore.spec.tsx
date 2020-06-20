import * as React from "react";
import { render, waitForElementToBeRemoved } from "@testing-library/react";
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

describe("Listen Store Tests", () => {
  let contextValue: TrelaContextValue<any, any>;
  let mountCounter: jest.Mock<any, any>;

  beforeEach(() => {
    mountCounter = jest.fn();
    contextValue = createContextValue({ apis, reducer, initState });
  });

  const UserLoader = () => {
    const { apis } = useTrela<StateType, ApisType>();
    const { fetchUsers } = apis;
    const [, isLoading] = fetchUsers().once();

    return isLoading ? <p>Loading</p> : null;
  };

  const App: React.FC<{ listenStore: boolean }> = ({ listenStore }) => {
    const { getState } = useTrela<StateType, ApisType>();
    const users = getState((state) => [state.users, listenStore]);

    mountCounter();

    return (
      <div>
        <h1>Users</h1>

        <ul>
          {users.map((user) => (
            <li key={`user-list-${user.id}`}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  const Root: React.FC<{ listenStore: boolean }> = (props) => (
    <TrelaProvider value={contextValue}>
      <App {...props} />
      <UserLoader />
    </TrelaProvider>
  );

  test("App Component listens to users in the store", async () => {
    const { queryByText, queryAllByText } = render(<Root listenStore={true} />);

    await waitForElementToBeRemoved(() => queryByText("Loading"));

    expect(mountCounter).toBeCalledTimes(2);
    expect(queryAllByText(/^Example/)).toHaveLength(
      responseMockData.users.length
    );
  });

  test("App Component doesn't listen to users in the store", async () => {
    const { queryByText, queryAllByText } = render(
      <Root listenStore={false} />
    );

    await waitForElementToBeRemoved(() => queryByText("Loading"));

    expect(mountCounter).toBeCalledTimes(1);
    expect(queryAllByText(/^Example/)).toHaveLength(0);
  });
});
