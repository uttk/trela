# Trela

`Trela` is a framework for handling simple asynchronous processing and store management with react.

# Feature

- Only for Hooks
- Asynchronous processing can be written simply
- The component view update considering component dependency
- TypeScript friendly

# To Be Developed

Currently a feature under development.

### Concurrent Mode Support

Corresponds to the Concurrent Mode of react. Where specifications have not been decided yet, I will implement it as soon as it is decided.

```jsx
/**
 * @Note Source code under development ( content subject to change )
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
  const [state] = anyApi().once();

  /* ... */
};

render(<Root />, document.getElementById("root"));
```

### Test Tools

I am working on making a tool that can be used with jest or mocha to make testing easier.

```jsx
/**
 * @Note Source code under development ( content subject to change )
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

  /**
   * @type { (store: StoreClass) => Affecters }
   * @description
   * Can define the actual processing for the asynchronous action.
   * Default definitions are defined in src/utils/createAffecters.ts
   */
  affecters: (store) => {
    return {
      // @type EffectType : "request" | "resolve" | "done" | "cancel" | "error"
      // @type effect : { type: EffectType; request: stirng; payload: any }
      // @type next : (effect) => void;
      // @type done : (effect) => void

      // When an asynchronous action is canceled
      cancel: (effect, next, done) => {
        /* ... */
      },

      // When an asynchronous action throws an error
      error: (effect, next, done) => {
        /* ... */
      },

      // When an asynchronous action is requested
      request: (effect, next, done) => {
        /* ... */
      },

      // Resolve the requested asynchronous action
      resolve: (effect, next, done) => {
        /* ... */
      },

      // Process resolved results
      done: (effect, next, done) => {
        /* ... */
      },
    };
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
The function in the object takes the same arguments as the function you defined, but the return value is StreamerClass instance.
Also, Return the same StreamerClass instance when the passed arguments are the same.

**Type : { [ key : string ] : (args: ...any[]) => StreamerClass }**

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

const ExampleComponent = () => {
  const { steps, apis } = useTrela();
  const { fetchUser, isLogin } = apis;

  const loginStreamer = isLogin();

  const userStreamer = fetchUser("example uid");
  const userStreamer2 = fetchUser("example uid");
  const userStreamer3 = fetchUser("other uid");

  // userStreamer === userStreamer2 // true
  // userStreamer === userStreamer3 // false

  /* ... */
};
```

## steps

Execute asynchronous actions serially.

**Type : ( streamers : StreamerClass[] ) => StreamerClass**

**Example**

```jsx
const ExampleComponent = () => {
  const { steps, apis } = useTrela();
  const {} = apis;

  // Perform asynchronous actions in array order
  // In this example: anyApi -> anyApi2
  const ref = steps([anyApi(), anyApi2("any arguments")]);

  const [state, isPending] = ref.once();

  /* ... */
};
```

## all

Execute asynchronous actions in parallel.

**Type : ( streamers : StreamerClass[] ) => StreamerClass**

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

## StreamerClass.once

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

## StreamerClass.start

Execute asynchronous action. If the action is running, skip the process.

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

## StreamerClass.forceStart

Force an asynchronous action. Also, the asynchronous action being executed will be canceled when the first argument is true.

**Type : ( cancel? : boolean, payload? : any ) => void**

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

## StreamerClass.cancel

Cancels a running asynchronous action.

**Type : ( payload? : any ) => void**

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

## StreamerClass.error

Raises an error to a running asynchronous action.

**Type : ( payload : Error ) => void**

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

      <button onClick={onClick}> Throw Error </button>

      {/* ... */}
    </>
  );
};

/* ... */
```

## StreamerClass.finish

Finishes the running asynchronous action.

**Type : ( payload? : any ) => void**

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("any arguments");

  const [state, isPending] = ref.once();

  const onClick = () => {
    ref.finish();
  };

  return (
    <>
      {/* ... */}

      <button onClick={onClick}> Finish Action </button>

      {/* ... */}
    </>
  );
};

/* ... */
```

## StreamerClass.addEventListener

Receive status of asynchronous action.

**Type : ( type : StreamerStatus, callback : () => void ) => removeListener**

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const { anyAPI } = apis;
  const ref = anyAPI("any arguments");

  const [state, isPending] = ref.once();

  useEffect(() => {
    // @type StreamerStatus : { "started" | "cancel" | "error" | "finished" }
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
