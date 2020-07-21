import { useContext } from "react";
import { TrelaContext } from "../context";
import { useDependency } from "./useDependency";
import { ApisBase, Selector, TrelaApi, FlowWrapApis } from "../type";

export const useTrela = <S, A extends ApisBase>(): TrelaApi<S, A> => {
  const context = useContext(TrelaContext);
  const dependency = useDependency(context);
  const { apis, flowMg } = context;

  return {
    apis: Object.keys(apis).reduce<FlowWrapApis<S, A>>((apis, apiName) => {
      return {
        ...apis,
        [apiName]: (...args: Parameters<A[keyof A]>) => {
          const flow = flowMg.createFlow(apiName, args, dependency);

          return flowMg.createFlowApi(flow);
        },
      };
    }, {} as FlowWrapApis<S, A>),

    steps: (flowList) => {
      const flow = flowMg.createSeriesFlow(flowList, dependency);

      return flowMg.createFlowApi(flow);
    },

    all: (flowList) => {
      const flow = flowMg.createParallelFlow(flowList, dependency);

      return flowMg.createFlowApi(flow);
    },

    getState: <R>(selector: Selector<S, R>): R => {
      const [state] = selector(context.store.getState());

      return state;
    },
  };
};
