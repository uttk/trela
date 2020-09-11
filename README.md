<p align="center">
  <img src="https://user-images.githubusercontent.com/46495635/91637609-a9764e80-ea44-11ea-8ece-2d96525e58da.png" alt="trela icon"/>
</p>

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
import { createTrelaContext } from "trela";

const apis = {
  fetchUser: async () => {
    const ref = await fetch("__YOUR_API_URL__");
    const json = await ref.json();

    return json; // { name: "Johon", age: 10 }
  },
}

const { Provider, useTrela } = createTrelaContext({ apis });

const App = () => {
  const { apis } = useTrela();
  const [user, isPending] = apis.fetchUser().read();

  return (
    <div>
      {isPending ? <p>Now Loading ...</p> : null}

      <h1>Current User</h1>
      <p>Name : {user?.name || "No name"}</p>
      <p>Age : {user.age || "No age"}</p>
    </div>
  );
};


const Root = () => (
  <Provider>
    <App />
  </Provider>
);

render(<Root />, document.getElementById("app"));
```

# Supports

You can ask us from the following URL. If you have any questions, please feel free😉

- [Discord](https://discord.gg/4MfGQ4N)

# API

## createTrelaContext

A function to create a Trela Context. The return value is an object that contains the Provider component and the useTrela function.

**Example**

```jsx
const { Provider, useTrela } = createTrelaContext({
  /* ... */
});
```

## Provider Component

A React component for providing Trela's API. Must be set to the root component of your app.

**Example**

```jsx
const { Provider } = createTrelaContext(/* ... */)

const App = () => {/* ... */}

const Root = () => (
  <Provider>
    <App />
  </Provider>
)
```


## useTrela

`useTrela` is React Custom Hooks what returns trela apis. The types are defined by TypeScript, and it is possible to execute APIs in a type-safe manner.

**Example**

```jsx
const ExampleComponent = () => {
  const { apis, steps, all } = useTrela();

  /* ... */
};
```

## apis

`apis` is an object that wraps the value of the `apis` property passed to the createTrelaContext function. Note that the same function is contained inside, but the behavior is different.

**Example**

```jsx
const { Provider, useTrela } = createContextValue({
  apis: {
    fetchUser: async (uid: number): User => {
      /* ... */
    },

    isLogin: async (uid) => {
      /* ... */
    },
  },
});

/* ... */

const ExampleComponent = () => {
  const { apis } = useTrela();
  const { fetchUser, isLogin } = apis;
  const user_id = 100;

  /**
   * @note Asynchronous processing does not start at this point
   * @note Also, You can pass arguments to the original fetchUser function
   */
  const fetchUserRef = fetchUser(user_id); 

  /**
   * @note Perform asynchronous processing
   * @return {User | null} fetchData - Contains the result of asynchronous processing or null
   * @return {boolean} isPending - Flag of whether asynchronous processing is running
   */
  const [fetchData, isPending] = fetchUserRef.read();

  /* ... */
};
```

## steps

Execute asynchronous actions serially.

**Example**

```jsx
const ExampleComponent = () => {
  const { steps, apis } = useTrela();
  const { anyApi, anyApi2 } = apis;

  // Perform asynchronous actions in array order
  // In this example: anyApi -> anyApi2
  const ref = steps([anyApi(), anyApi2("any arguments")]);

  const [state, isPending] = ref.read();

  /* ... */
};
```

## all

Execute asynchronous actions in parallel.

**Example**

```jsx
const ExampleComponent = () => {
  const { all, apis } = useTrela();
  const { anyApi, anyApi2 } = apis;

  // Execute asynchronous actions in parallel
  const ref = all([anyApi(), anyApi2("any arguments")]);

  const [state, isPending] = ref.read();

  /* ... */
};
```

## read

Execute asynchronous action only once and update the view when the action is complete. Also, This function can be directly written to the component field.

The return value is an array and the 0th value is the result of the asynchronous action or null, the 1st value is boolean indicating whether processing is being executed.

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const [state, isPending] = apis.anyAPI("any arguments").read();

  /* ... */
};
```

## start

Execute asynchronous action. Skip the process when the action is running.

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

## cancel

Cancels a running asynchronous action.

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const ref = apis.anyAPI("any arguments");

  const [state, isPending] = ref.read();

  const onClick = () => {
    ref.cancel();
  };

  return (
    <>
      {/* ... */}

      <button onClick={onClick}> Cancel asynchronous action </button>

      {/* ... */}
    </>
  );
};

/* ... */
```

## default

Sets the default value for asynchronous actions. You can use this function to prevent null from entering the communication result.

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const ref = apis.anyAPI("any arguments");

  /**
   * @return {string} result - The default function eliminates nulls and converges to a string type
   */
  const [result, isPending] = ref.default("default Value").read();

  /* ... */
};

/* ... */
```

## only

Running the API from the only property allows you to perform asynchronous actions so that the component views is not updated

**Example**

```jsx
const ExampleComponent = () => {
  const { apis } = useTrela();
  const ref = apis.anyAPI("any arguments");
  const [result, isPending] = ref.only.read();

  /* ... */
};

/* ... */
```

# License

[MIT](LICENSE "LICENSE")
