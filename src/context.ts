import { createContext } from "react";
import { TrelaContextValue } from "./type";

export const defaultContextValue: TrelaContextValue<any, any> = {
  store: {} as any,
  flowMg: {} as any,
  dependencyMg: {} as any,
  isDefault: true,
};

export const TrelaContext = createContext(defaultContextValue);
