import { useContext } from "react";
import { TrelaContext } from "../context";
import { useDependency } from "./useDependency";
import { createFlow } from "../util/createFlow";
import { createDispacher } from "../util/createDispacher";
import { affectDispachFactory } from "../util/affectDispachFactory";
import { ApisBase, Selector, TrelaApis, Flow, WrapApis } from "../types";

export const useTrela = <S, A extends ApisBase>(): TrelaApis<S, A> => {
  const context = useContext(TrelaContext);
  const { apis } = context;
  const dependency = useDependency(context.dependencies);

  return {
    apis: Object.keys(apis || {}).reduce<WrapApis<S, A>>(
      (wrapApis, request) => {
        return {
          ...wrapApis,

          [request]: (...payload) => {
            const id = JSON.stringify(payload);
            const createDispach = affectDispachFactory(request, payload);
            const dispacher = createDispacher(id, createDispach);

            return createFlow(context, dispacher);
          },
        };
      },
      {} as WrapApis<S, A>
    ),

    all: (flows: Flow<S>[]) => {
      const id = `[${flows.map((flow) => flow.id).join("")}]`;
      const createDispach = (() => void 0) as any;
      const dispacher = createDispacher(id, createDispach);

      return createFlow(context, dispacher);
    },

    steps: (flows: Flow<S>[]) => {
      const id = `<${flows.map((flow) => flow.id).join("")}>`;
      const createDispach = (() => void 0) as any;
      const dispacher = createDispacher(id, createDispach);

      return createFlow(context, dispacher);
    },

    getState: <R>(selector: Selector<S, R>): R => {
      const [state] = selector(context.store);

      dependency.selectors.push(selector);

      return state;
    },
  };
};
