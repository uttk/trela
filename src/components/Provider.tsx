import React from "react";
import { TrelaContext } from "../context";
import { TrelaContextValue } from "../types";

export const TrelaProvider: React.FC<{
  value: TrelaContextValue<any, any>;
}> = ({ value, children }) => (
  <TrelaContext.Provider value={value}>{children}</TrelaContext.Provider>
);
