import { useContext } from "react";
import { TrelaContext } from "../context";
import { useDependency } from "./useDependency";
import { createWrapApis } from "../util/createWrapApis";
import { ApisBase, Selector, TrelaApis } from "../types";

export const useTrela = <S, A extends ApisBase>(): TrelaApis<S, A> => {
  const context = useContext(TrelaContext);
  const dependency = useDependency(context.dependencies);

  return {
    apis: createWrapApis(context),

    getState: <R>(selector: Selector<S, R>): R => {
      const [state] = selector(context.store);

      dependency.selectors.push(selector);

      return state;
    },

    all: () => void 0 as any,
    steps: () => void 0 as any,
  };
};
