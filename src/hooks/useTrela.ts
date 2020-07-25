import { useContext } from "react";
import { TrelaContext } from "../context";
import { useDependency } from "./useDependency";
import { ApisBase, Selector, TrelaApi, FlowWrapApis, Flow } from "../type";

export const useTrela = <S, A extends ApisBase>(): TrelaApi<S, A> => {
  const context = useContext(TrelaContext);
  const dependency = useDependency(context);
  const { store, flowMg } = context;

  return {
    apis: store.getApiKeys().reduce<FlowWrapApis<S, A>>((wrapApis, apiName) => {
      return {
        ...wrapApis,

        [apiName]: (...args: Parameters<A[keyof A]>) => {
          return flowMg.createFlowApi(
            flowMg.createFlow(apiName, args),
            dependency
          );
        },
      };
    }, {} as FlowWrapApis<S, A>),

    steps: (flowIds) => {
      const flowList = flowIds.reduce<Flow<S, A>[]>((list, v) => {
        const flow = flowMg.getFlow(v.id);
        return flow ? list.concat(flow) : list;
      }, []);

      return flowMg.createFlowApi(
        flowMg.createSeriesFlow(flowList),
        dependency
      );
    },

    all: (flowIds) => {
      const flowList = flowIds.reduce<Flow<S, A>[]>((list, v) => {
        const flow = flowMg.getFlow(v.id);
        return flow ? list.concat(flow) : list;
      }, []);

      return flowMg.createFlowApi(
        flowMg.createParallelFlow(flowList),
        dependency
      );
    },

    getState: <R>(selector: Selector<S, R>): R => {
      const [state] = selector(context.store.getState());

      dependency.selectors.add(selector);

      return state;
    },
  };
};
