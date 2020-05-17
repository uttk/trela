import * as React from "react";
import { DefaultTrelaContext } from "../utils/context";
import { TrelaContextValue } from "../types";

interface TrelaProviderProps {
  value: TrelaContextValue<any, any>;
}

export const TrelaProvider: React.FC<TrelaProviderProps> = ({
  value,
  children,
}) => (
  <DefaultTrelaContext.Provider value={value}>
    {children}
  </DefaultTrelaContext.Provider>
);
