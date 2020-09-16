import { useContext, Context } from "react";
import { TrelaContext } from "../context";
import { createFlowApi } from "../elements/flow";
import {
  createSeriesPromise,
  createParallelPromise,
} from "../elements/promise";
import {
  FlowApi,
  ApisBase,
  TrelaApi,
  FlowRequest,
  TrelaWrapApis,
  TrelaContextValue,
} from "../type";
import { useDependency } from "./useDependency";

export const useTrela = <A extends ApisBase>(
  context: Context<TrelaContextValue<A>> = TrelaContext
): TrelaApi<A> => {
  const { apiStore, flowStore, dependencyStore, dispatch } = useContext(
    context
  );

  const { flowKeys } = flowStore;
  const dependency = useDependency(dependencyStore);

  const createFlowRequest = <R>(
    key: string,
    createPromise: () => Promise<R>
  ): FlowRequest<R> => {
    const cache = flowKeys.get(key);
    const id = cache || flowKeys.size + 1;

    flowKeys.set(key, id);

    return {
      id,
      action: "none",
      fromDependency: dependency.id,
      createPromise,
    };
  };

  return {
    apis: apiStore.apiKeys.reduce<TrelaWrapApis<A>>((wrapApis, name) => {
      return {
        ...wrapApis,

        [name]: (...args: Parameters<A[keyof A]>) => {
          const key = `${name}${JSON.stringify(args)}`;

          return createFlowApi(
            createFlowRequest(key, () => apiStore.apis[name](...args)),
            dispatch
          );
        },
      };
    }, {} as TrelaWrapApis<A>),

    steps: <F extends readonly FlowApi<A>[]>(flowApis: [...F]) => {
      return createFlowApi(
        createFlowRequest(`s:${flowApis.map((v) => v.id).join("")}`, () =>
          createSeriesPromise(flowApis, dispatch)
        ),
        dispatch
      );
    },

    all: <F extends readonly FlowApi<A>[]>(flowApis: [...F]) => {
      return createFlowApi(
        createFlowRequest(`p:${flowApis.map((v) => v.id).join("")}`, () =>
          createParallelPromise(flowApis, dispatch)
        ),
        dispatch
      );
    },
  };
};
