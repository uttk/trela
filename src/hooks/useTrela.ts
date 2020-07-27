import { useContext } from "react";
import { TrelaContext } from "../context";
import {
  ApisBase,
  Selector,
  TrelaApi,
  FlowWrapApis,
  TrelaContextValue,
} from "../type";
import { useDependency } from "./useDependency";

export const useTrela = <S, A extends ApisBase>(): TrelaApi<S, A> => {
  const context = useContext<TrelaContextValue<S, A>>(TrelaContext);
  const dependency = useDependency(context);
  const {
    apis,
    store,
    flowMg,
    utils: {
      setup,
      createFlowApi,
      createApiRequest,
      createSeriesRequest,
      createParallelRequest,
    },
  } = context;

  return {
    apis: Object.keys(apis).reduce<FlowWrapApis<S, A>>((wrapApis, apiName) => {
      return {
        ...wrapApis,

        [apiName]: (...args: Parameters<A[keyof A]>) => {
          const id = flowMg.createId(apiName + JSON.stringify(args));
          const flow = flowMg.createFlow(id, createApiRequest(apiName, args));

          return createFlowApi(flow, () => setup(flow, dependency));
        },
      };
    }, {} as FlowWrapApis<S, A>),

    steps: (flowApis) => {
      const flowList = flowApis.map((v) => flowMg.getFlowFromApi(v));
      const id = flowMg.createId("s:" + flowList.map((v) => v.id).join(""));
      const flow = flowMg.createFlow(id, createSeriesRequest(flowList));

      return createFlowApi(flow, () => setup(flow, dependency));
    },

    all: (flowApis) => {
      const flowList = flowApis.map((v) => flowMg.getFlowFromApi(v));
      const id = flowMg.createId("p:" + flowList.map((v) => v.id).join(""));
      const flow = flowMg.createFlow(id, createParallelRequest(flowList));

      return createFlowApi(flow, () => setup(flow, dependency));
    },

    getState: <R>(selector: Selector<S, R>): R => {
      const [state] = selector(store.getState());

      dependency.selectors.add(selector);

      return state;
    },
  };
};
