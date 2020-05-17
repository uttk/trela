import { createContext } from "react";
import { TrelaContextValue } from "../types";

const noopTrela = {} as TrelaContextValue<any, any>;

export const DefaultTrelaContext = createContext<TrelaContextValue<any, any>>(
  noopTrela
);
