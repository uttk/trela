import { useContext } from "react";
import { TrelaContext } from "../context";
import { useDependency } from "./useDependency";
import { ApisBase, Selector, TrelaApi, FlowWrapApis } from "../type";

export const useTrela = <S, A extends ApisBase>(): TrelaApi<S, A> => {
  const context = useContext(TrelaContext);
  const dependency = useDependency(context);
  const { apis, flowMg } = context;

  return {
    apis: Object.keys(apis).reduce<FlowWrapApis<S, A>>((wrapApis, apiName) => {
      return {
        ...wrapApis,

        [apiName]: (...args: Parameters<A[keyof A]>) => {
          const flow = flowMg.createFlow(apiName, args);

          return flowMg.createFlowApi(flow, dependency);
        },
      };
    }, {} as FlowWrapApis<S, A>),

    steps: (flowList) => {
      const flow = flowMg.createSeriesFlow(flowList);

      return flowMg.createFlowApi(flow, dependency);
    },

    all: (flowList) => {
      const flow = flowMg.createParallelFlow(flowList);

      return flowMg.createFlowApi(flow, dependency);
    },

    getState: <R>(selector: Selector<S, R>): R => {
      const [state] = selector(context.store.getState());

      dependency.selector.push(selector);

      return state;
    },
  };
};
