import { createDependencyStore } from "../elements/dependency";
import { createFlowStore } from "../elements/flow";
import { createRelationStore } from "../elements/relation";
import {
  ApiStore,
  ApisBase,
  TrelaMode,
  TrelaContextValue,
  TrelaContextOptions,
} from "../type";
import { createDispatch } from "./createDispatch";

export const createContextValue = <A extends ApisBase>(
  options: TrelaContextOptions<A>
): TrelaContextValue<A> => {
  const { apis } = options;

  const apiStore: ApiStore<A> = {
    apis,
    apiKeys: Object.keys(apis),
  };

  const flowStore = createFlowStore();
  const dependencyStore = createDependencyStore();
  const relationStore = createRelationStore(dependencyStore);

  return {
    mode: TrelaMode.conventional,

    apiStore,
    flowStore,
    dependencyStore,

    dispatch: createDispatch({ flowStore, dependencyStore, relationStore }),
  };
};
