import { useContext } from "react";
import { DefaultTrelaContext } from "../utils/context";
import { Store, ApisBase } from "../types";

export const useStore = <S, A extends ApisBase>(): Store<S, A> => {
  const { store } = useContext(DefaultTrelaContext);

  return store;
};
