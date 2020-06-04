# Trela

`Trela` is a framework for handling simple asynchronous processing and store management with react.

# Feature

- Only for Hooks
- Asynchronous processing can be written simply
- Drawing update considering dependency

# To Be Developed

Currently a feature under development.

### Concurrent Mode Support

Corresponds to the Concurrent Mode of react. Where specifications have not been decided yet, I will implement it as soon as it is decided.

```jsx
/**
 * @title Source code under development ( content subject to change )
 */

import React from "react";
import { render } from "react-dom";
import {
  useTrela,
  TrelaProvider,
  TrelaSuspense,
  createContextValue,
} from "trela";

const contextValue = createContextValue({
  /* ... */
});

const Spinner = () => <div>Loading ...</div>;

const Root = () => (
  <TrelaProvider value={contextValue}>
    <TrelaSuspense fallback={<Spinner />}>
      <ExampleComponent />
    </TrelaSuspense>
  </TrelaProvider>
);

const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyApi } = apis;
  const [state] = anyApi().start((state) => state);

  /* ... */
};

render(<Root />, document.getElementById("root"));
```

### Test Tools

I am working on making a tool that can be used with jest or mocha to make testing easier.

```jsx
/**
 * @title Source code under development ( content subject to change )
 */

import { render, wait } from "any-testing-library";
import { TrelaProvider, createMock } from "trela";
import { ExampleCompoent } from "./ExampleComponent";

describe("Example Test", () => {
  test("Asynchronous processing test", async () => {
    const mock = createMock({
      apis: {
        fetchUser: () => {},
      },
    });

    render(
      <TrelaProvider value={mock}>
        <ExampleCompoent />
      </TrelaProvider>
    );

    await wait(() => expect(mock.fetchUser.complite).toBeTruthy());
  });
});
```

# Install

```
$> npm install trela
```

or

```
$> yarn add trela
```

# Example

```jsx
import React from "react";
import { render } from "react-dom";
import { createContextValue, TrelaProvider, useTrela } from "trela";

const App = () => {
  const { apis } = useTrela();
  const { fechUser } = apis;
  const [user, isPending] = fetchUser().start((state) => state.user);

  return (
    <div>
      {isPending ? <p>Now Loading ...</p> : null}
      <h1>Current User</h1>
      <p>Name : {user.name}</p>
      <p>Age : {user.age || "Not set yet"}</p>
    </div>
  );
};

const contextValue = createContextValue({
  initState: {
    user: {
      name: "Not set yet",
      age: NaN,
    },
  },

  reducer: (state, action) => {
    switch (action.type) {
      case "fetchUser":
        return { ...state, user: action.payload };

      default:
        return state;
    }
  },

  apis: {
    fetchUser: async () => {
      const ref = await fetch("__YOUR_API_URL__");
      const json = await ref.json();

      return json;
    },
  },
});

const Root = () => (
  <TrelaProvider value={contextValue}>
    <App />
  </TrelaProvider>
);

render(<Root />, document.getElementById("app"));
```

# APIs

## TrelaProvider

The Provider Component of `trela`.

```jsx
const contextValue = createContextValue({
  /* ... */
});

const RootComponent = () => (
  <TrelaProvider value={contextValue}>{/* ... */}</TrelaProvider>
);
```

## createContextValue

Create a value to pass to TrelaProvider.

```javascript
const contextValue = createContextValue({
  /**
   * @required
   * @type { any }
   * @description Initial value of store
   */
  initState: {
    isLogin: false,

    user: {
      name: "Not set yet",
      age: NaN,
    },
  },

  /**
   * @required
   * @type { <S>(state: S, action: { type: string; payload: any }) => S }
   * @description reducer that resolves action
   */
  reducer: (state, action) => {
    switch (actin.type) {
      case "fetchUser":
        return { ...state, user: action.payload };

      case "isLogin":
        return { ...state, isLogin: action.payload };

      default:
        return state;
    }
  },

  /**
   * @type { { [key:string]: (...args:any[]) => Promise<any> } }
   */
  apis: {
    fetchUser: async () => {
      const ref = await fetch("__YOUR_API_URL__");
      const user = await ref.json();

      return user;
    },

    isLogin: async () => {
      const ref = await fetch("__YOUR_API_URL__");
      const { isLogin } = await ref.json();

      return { isLogin };
    },
  },
});
```

## useStore

Custom Hooks to get the Store.

```jsx
const ExampleComponent = () => {
  const store = useStore();
  const state = store.getState();

  useEffect(() => {
    store.subscribe((latestState) => {
      /* ... */
    });
  }, []);

  return (
    <button
      onClick={() =>
        store.dispatch({
          /* ... */
        })
      }
    >
      dispatch
    </button>
  );
};
```

## useTrela

`useTrela` is React Custom Hooks whateturns the set apis and trela apis.

```jsx
const contextValue = createContextValue({
  /* ... */

  apis: {
    fetchUser: async (uid) => {
      /* ... */
    },
  },
});

const Root = () => (
  <TrelaProvider value={contextValue}>
    <ExampleComponent />
  </TrelaProvider>
);

const ExampleComponent = () => {
  const { apis } = useTrela();
  const { fechUser } = apis;
  const [state, isPending] = fetchUser("example-uid").start((s) => s);

  /* ... */
};

render(<Root />, document.getElementById("root"));
```

## getState

Returns the store values and listens to the store value.

```jsx
const contextValue = createContextValue({
  /* ... */

  apis: {
    fetchUser: async (uid) => {
      /* ... */
    },

    isLogin: async () => {
      /* ... */
    },
  },
});

const Root = () => (
  <TrelaProvider value={contextValue}>
    <ExampleComponent />
  </TrelaProvider>
);

const ExampleComponent = () => {
  const { getState } = useTrela();

  // Returns the 0th value in the array.
  // When 1th value in the array is True, 
  // the view will be updated when the Store value is updated.
  const selectedState = getState((state) => [state, true])


  /* ... */
};

render(<Root />, document.getElementById("root"));
```


## steps

Execute asynchronous actions serially.

```jsx
const contextValue = createContextValue({
  /* ... */

  apis: {
    fetchUser: async (uid) => {
      /* ... */
    },

    isLogin: async () => {
      /* ... */
    },
  },
});

const Root = () => (
  <TrelaProvider value={contextValue}>
    <ExampleComponent />
  </TrelaProvider>
);

const ExampleComponent = () => {
  const { steps, apis } = useTrela();
  const { fetchUser, checkLogin } = apis;

  // Perform asynchronous actions in array order
  // In this example: checkLogin -> fetchUser
  const ref = steps([checkLogin(), fetchUser("example-uid")]);

  const [state, isPending] = ref.start((state) => state);

  /* ... */
};

render(<Root />, document.getElementById("root"));
```

## all

Execute asynchronous actions in parallel.

```jsx
import React from "react";
import { render } from "react-dom";
import { useTrela, TrelaProvider, createContextValue } from "trela";

const contextValue = createContextValue({
  /* ... */

  apis: {
    fetchUser: async (uid) => {
      /* ... */
    },

    isLogin: async () => {
      /* ... */
    },
  },
});

const Root = () => (
  <TrelaProvider value={contextValue}>
    <ExampleComponent />
  </TrelaProvider>
);

const ExampleComponent = () => {
  const { all, apis } = useTrela();
  const { fetchUser, checkLogin } = apis;

  // Execute asynchronous actions in parallel
  const ref = all([checkLogin(), fetchUser("example-uid")]);

  const [state, isPending] = ref.start((state) => state);

  /* ... */
};

render(<Root />, document.getElementById("root"));
```

## [Any].start

Execute asynchronous action only once.

```jsx
const contextValue = createContextValue({
  apis: {
    anyAPI: async (args) => {
      /* ... */
    },
  },
});

const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const [state, isPending] = anyAPI("Any arguments").start((state) => state);

  /* ... */
};

/* ... */
```

## [Any].forceStart

Force an asynchronous action. Also, the asynchronous action being executed will be canceled.

```jsx
const contextValue = createContextValue({
  apis: {
    anyAPI: async (args) => {
      /* ... */
    },
  },
});

const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;

  useEffect(() => {
    anyAPI("Any arguments").forceStart();
  }, []);

  /* ... */
};

/* ... */
```

## [Any].cancel

Cancels a running asynchronous action.

```jsx
const contextValue = createContextValue({
  apis: {
    anyAPI: async (args) => {
      /* ... */
    },
  },
});

const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("Any arguments");
  const [state, isPending] = ref.start((state) => state);

  return (
    <>
      {/* ... */}

      <button onClick={() => ref.cancel()}>cancel</button>

      {/* ... */}
    </>
  );
};

/* ... */
```

## [Any].error

Raises an error to a running asynchronous action.

```jsx
const contextValue = createContextValue({
  apis: {
    anyAPI: async (args) => {
      /* ... */
    },
  },
});

const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("Any arguments");
  const [state, isPending] = ref.start((state) => state);

  return (
    <>
      {/* ... */}

      <button onClick={() => ref.error(new Error("anything"))}>error</button>

      {/* ... */}
    </>
  );
};

/* ... */
```

## [Any].finish

Finishes the running asynchronous action.

```jsx
const contextValue = createContextValue({
  apis: {
    anyAPI: async (args) => {
      /* ... */
    },
  },
});

const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("Any arguments");
  const [state, isPending] = ref.start((state) => state);

  return (
    <>
      {/* ... */}

      <button onClick={() => ref.finish()}>finish</button>

      {/* ... */}
    </>
  );
};

/* ... */
```

## [Any].addEventListener

Receive status of asynchronous action.

```jsx
const contextValue = createContextValue({
  apis: {
    anyAPI: async (args) => {
      /* ... */
    },
  },
});

const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("Any arguments");
  const [state, isPending] = ref.start((state) => state);

  useEffect(() => {
    const types = ["started", "cancel", "error", "finished"];

    const removeListeners = types.map((type) => {
      return ref.addEventListener(type, () => {
        /* ... */
      });
    });

    return () => removeListeners.forEach((cb) => cb());
  }, []);

  /* ... */
};

/* ... */
```

# License

[MIT](LICENSE "LICENSE")
