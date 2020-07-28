import { DependencyManagerClass } from "../elements/dependencyManager";
import { FlowManagerClass } from "../elements/flowManager";
import { StoreClass } from "../elements/store";
import { createApiRequest } from "../request/createApiRequest";
import { createParallelRequest } from "../request/createParallelRequest";
import { createSeriesRequest } from "../request/createSeriesRequest";
import { ApisBase, ContextOptions, TrelaContextValue } from "../type";
import { createFlowApi } from "./createFlowApi";
import { createSetup } from "./createSetup";

export const createContextValue = <S, A extends ApisBase>(
  options: ContextOptions<S, A>
): TrelaContextValue<S, A> => {
  const store = new StoreClass(options);
  const flowMg = new FlowManagerClass(store);
  const dependencyMg = new DependencyManagerClass();

  return {
    apis: options.apis,
    store,
    flowMg,
    dependencyMg,
    utils: {
      setup: createSetup(dependencyMg),
      createFlowApi,
      createApiRequest,
      createSeriesRequest,
      createParallelRequest,
    },
  };
};
