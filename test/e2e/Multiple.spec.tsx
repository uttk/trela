import {
  render,
  waitFor,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import * as React from "react";
import { apis, ApisType, responseMockData } from "./utils";
import { TrelaContext, createTrelaContext } from "@/index";

describe("Multiple Use Case", () => {
  const ComponentCount = 3;
  let Context: TrelaContext<ApisType>;
  let mountCounters: Array<jest.Mock<void, []>>;

  beforeEach(() => {
    mountCounters = new Array(ComponentCount).fill(0).map(() => jest.fn());
    Context = createTrelaContext({ apis });
  });

  const DisplayUserList: React.FC<{ id: number }> = ({ id }) => {
    const { apis } = Context.useTrela();
    const { fetchUsers } = apis;
    const [users, isLoading] = fetchUsers().read();

    mountCounters[id]();

    if (isLoading) return <p>Loading User List {id}</p>;

    return (
      <div>
        <h1>User List {id}</h1>

        <ul>
          {users?.map((user, i) => (
            <li key={`user-${i}`}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  const App = () => {
    const { apis } = Context.useTrela();
    const { fetchUsers } = apis;
    const ref = fetchUsers();

    return (
      <div>
        <h1>All Users</h1>

        <ul>
          {new Array(ComponentCount).fill(0).map((_, i) => (
            <DisplayUserList key={`user-list-${i}`} id={i}></DisplayUserList>
          ))}
        </ul>

        <button onClick={() => ref.start()}>Refetch</button>
        <button onClick={() => ref.cancel()}>Cancel</button>
      </div>
    );
  };

  const Root = () => (
    <Context.Provider>
      <App />
    </Context.Provider>
  );

  test("Display User List", async () => {
    const { getAllByText } = render(<Root />);

    await waitFor(() =>
      expect(getAllByText(/^Example/)).toHaveLength(
        responseMockData.users.length * ComponentCount
      )
    );
  });

  test("Can be displayed Loading Status", async () => {
    const { queryAllByText } = render(<Root />);
    const label = /Loading User List \d/;

    await waitForElementToBeRemoved(() => queryAllByText(label));
  });

  test("Keep the display count to a minimum", async () => {
    const { queryAllByText } = render(<Root />);
    const label = /Loading User List \d/;

    await waitForElementToBeRemoved(() => queryAllByText(label));

    mountCounters.forEach((mountCounter) => {
      expect(mountCounter).toHaveBeenCalledTimes(2);
    });
  });

  test("Can cancel the fetchUsers action", async () => {
    const { getByText, queryAllByText } = render(<Root />);
    const cancelButton = getByText("Cancel");
    const label = /Loading User List \d/;

    expect(queryAllByText(label)).not.toHaveLength(0);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(queryAllByText(label)).toHaveLength(0));

    mountCounters.forEach((mountCounter) => {
      expect(mountCounter).toBeCalledTimes(2);
    });
    expect(queryAllByText(/^Example/)).toHaveLength(0);
  });

  test("Can refetch users", async () => {
    const { getByText, queryAllByText } = render(<Root />);
    const label = /Loading User List \d/;

    expect(queryAllByText(/^Example/)).toHaveLength(0);

    await waitForElementToBeRemoved(() => queryAllByText(label));
    expect(queryAllByText(/^Example/)).toHaveLength(
      responseMockData.users.length * ComponentCount
    );

    const refetchButton = getByText("Refetch");

    fireEvent.click(refetchButton);

    await waitForElementToBeRemoved(() => queryAllByText(label));
    expect(queryAllByText(/^Example/)).toHaveLength(
      responseMockData.users.length * ComponentCount
    );
    mountCounters.forEach((mountCounter) => {
      expect(mountCounter).toBeCalledTimes(4);
    });
  });
});
