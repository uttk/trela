import { createContext } from "react";
import { TrelaContextValue, TrelaMode } from "./type";

export const defaultContextValue: TrelaContextValue<any> = {
  mode: TrelaMode.conventional,
  apiStore: {} as any,
  flowStore: {} as any,
  dependencyStore: {} as any,
  dispatch: (() => void 0) as any,
};

export const TrelaContext = createContext(defaultContextValue);
