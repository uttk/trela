import { useContext } from "react";
import { TrelaContext } from "../context";
import { Store, ApisBase } from "../type/index";

export const useStore = <S, A extends ApisBase>(): Store<S, A> => {
  const { store } = useContext(TrelaContext);

  return store;
};
