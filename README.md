# Trela

`Trela` is a framework for handling simple asynchronous processing and store management with react.

# Feature

- Only for Hooks
- Asynchronous processing can be written simply
- The component view update considering component dependency
- TypeScript friendly

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
  const [state, isPending] = fetchUser().once();
  const { user } = state;

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

# Supports

You can ask us from the following URL. If you have any questions, please feel free😉

- [Discord](https://discord.gg/4MfGQ4N)

# APIs

## TrelaProvider

The Provider Component of `trela`. For the value prop, specify the return value of the createContextValue function.

**Type : ReactComponent**

**Example**

```jsx
const contextValue = createContextValue({
  /* ... */
});

const RootComponent = () => (
  <TrelaProvider value={contextValue}>
    {/* YOUR ANY COMPONENTS */}
  </TrelaProvider>
);
```

## createContextValue

Create a value to pass to TrelaProvider.

**Type : (options: TrelaOptions) => ContextValue**

**Example**

```javascript
const contextValue = createContextValue({
  /**
   * @required
   * @type { any }
   * @description
   * Initial value of store
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
   * @description
   * reducer that resolves action
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
   * @required
   * @type { { [key:string]: (...args:any[]) => Promise<any> } }
   * @description
   * Define asynchronous actions
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

**Type : () => StoreClass**

**Example**

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

`useTrela` is React Custom Hooks what returns trela apis.

**Type : \<StoreType, ApisType\>() => TrelaAPIs**

**Example**

```jsx
const ExampleComponent = () => {
  const TrelaApis = useTrela();

  /* ... */
};
```

Also, if you can use TypeScript, it is convenient to specify generics.

```tsx
const initState = {
  name: "",
  age: 0,
};

const apis = {
  anyApi: async () => {
    /* ... */
  },
};

type StateType = typeof initState;
type ApisType = typeof apis;

const ExampleComponent: React.FC = () => {
  const TrelaApis = useTrela<StateType, ApisType>();

  /* ... */
};

/* ... */
```

## getState

Returns the store values and listens to the store value.
This function returns the 0th value in the array, when 1th value in the array is True, the view will be updated when the Store value is updated.

**Type : \<S\>( ( state : StateType ) => [S] | [S, boolean] ) => S**

**Example**

```jsx
const ExampleComponent = () => {
  const { getState } = useTrela();
  const selectedState = getState((state) => [state, true]);

  /* ... */
};
```

## apis

`apis` is an object that wrapped the `apis` object defined by the createContextValue function.
The function in the object takes the same arguments as the function you defined, but the return value is Flow instance.
Also, Return the same Flow instance when the passed arguments are the same.

**Type : { [ key : string ] : (args: ...any[]) => Flow }**

**Example**

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

/* ... */

const ExampleComponent = () => {
  const { steps, apis } = useTrela();
  const { fetchUser, isLogin } = apis;

  const loginFlow = isLogin();

  const userFlow = fetchUser("example uid");
  const userFlow2 = fetchUser("example uid");
  const userFlow3 = fetchUser("other uid");

  // userFlow === userFlow2 // true
  // userFlow === userFlow3 // false

  /* ... */
};
```

## steps

Execute asynchronous actions serially.

**Type : ( flows : Flow[] ) => Flow**

**Example**

```jsx
const ExampleComponent = () => {
  const { steps, apis } = useTrela();
  const { anyApi, anyApi2 } = apis;

  // Perform asynchronous actions in array order
  // In this example: anyApi -> anyApi2
  const ref = steps([anyApi(), anyApi2("any arguments")]);

  const [state, isPending] = ref.once();

  /* ... */
};
```

## all

Execute asynchronous actions in parallel.

**Type : ( flows : Flow[] ) => Flow**

**Example**

```jsx
const ExampleComponent = () => {
  const { all, apis } = useTrela();
  const { anyApi, anyApi2 } = apis;

  // Execute asynchronous actions in parallel
  const ref = all([anyApi(), anyApi2("any arguments")]);

  const [state, isPending] = ref.once();

  /* ... */
};
```

## Flow.once

Execute asynchronous action only once and update the view when the action is complete. Also, This function can be directly written to the component field.

The return value is an array, and the 0th value is latest State value, the 1st value is boolean indicating whether processing is being executed.

**Type : () => [StateType, boolean]**

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const [state, isPending] = anyAPI("any arguments").once();

  /* ... */
};
```

## Flow.start

Execute asynchronous action. Skip the process when the action is running.

**Type : () => void**

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;

  const onClick = () => {
    anyAPI("any arguments").start();
  };

  return (
    <>
      {/* ... */}

      <button onClick={onClick}> Execute Action </button>

      {/* ... */}
    </>
  );

  /* ... */
};

/* ... */
```

## Flow.forceStart

Force an asynchronous action. Also, the asynchronous action being executed will be canceled when the first argument is true.

**Type : () => void**

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;

  useEffect(() => {
    anyAPI("any arguments").forceStart();
  }, []);

  /* ... */
};

/* ... */
```

## Flow.cancel

Cancels a running asynchronous action.

**Type : () => void**

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("any arguments");

  const [state, isPending] = ref.once();

  const onClick = () => {
    ref.cancel();
  };

  return (
    <>
      {/* ... */}

      <button onClick={onClick}> Cancel Action </button>

      {/* ... */}
    </>
  );
};

/* ... */
```

## Flow.error

Raises an error to a running asynchronous action.

**Type : ( payload? : Error ) => void**

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("any arguments");

  const [state, isPending] = ref.once();

  const onClick = () => {
    const error = new Error("anything");
    ref.error(error);
  };

  return (
    <>
      {/* ... */}

      <button onClick={onClick}> Send an Error </button>

      {/* ... */}
    </>
  );
};

/* ... */
```

## Flow.complete

Completes the running asynchronous action.

**Type : () => void**

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("any arguments");

  const [state, isPending] = ref.once();

  const onClick = () => {
    ref.complete();
  };

  return (
    <>
      {/* ... */}

      <button onClick={onClick}> Complete Action </button>

      {/* ... */}
    </>
  );
};

/* ... */
```

## Flow.addEventListener

Receive status of asynchronous action.

**Type : ( type : FlowStatus, callback : () => void ) => removeListener**

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("any arguments");

  const [state, isPending] = ref.once();

  useEffect(() => {
    // @type FlowStatus : "started" | "cancel" | "error" | "finished"
    const removeListener = ref.addEventListener("started", () => {
      /* ... */
    });

    return removeListener;
  }, []);

  /* ... */
};

/* ... */
```

# License

[MIT](LICENSE "LICENSE")
