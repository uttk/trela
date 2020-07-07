import { createContext } from "react";
import { TrelaContextValue } from "./types";

export const defaultContextValue: TrelaContextValue<any, any> = {
  apis: null,
  store: null,
  flows: [],
  affecters: {} as any,
  dependencies: new Map(),
};

export const TrelaContext = createContext(defaultContextValue);
