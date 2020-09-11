import React, { createContext } from "react";
import { useTrela } from "../hooks/useTrela";
import { ApisBase, TrelaContext, TrelaContextOptions } from "../type";
import { createContextValue } from "./createContextValue";

export const createTrelaContext = <A extends ApisBase>(
  options: TrelaContextOptions<A>
): TrelaContext<A> => {
  const value = createContextValue(options);
  const Context = createContext(value);

  return {
    Provider({ children }) {
      return <Context.Provider value={value}>{children}</Context.Provider>;
    },

    useTrela: () => useTrela(Context),
  };
};
