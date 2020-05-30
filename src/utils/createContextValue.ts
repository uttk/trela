import { StoreClass } from "../elements/StoreClass";
import { createAffecters } from "./createAffecters";
import { StreamerManagerClass } from "../managers/StreamerManagerClass";
import { DependencyManagerClass } from "../managers/DependencyManagerClass";
import { ApisBase, TrelaOptions, TrelaContextValue } from "../types";

export const createContextValue = <S, A extends ApisBase>(
  options: TrelaOptions<S, A>
): TrelaContextValue<S, A> => {
  const store = new StoreClass(options);
  const affecters = createAffecters(store);
  const dependencyMg = new DependencyManagerClass(store);
  const streamerMg = new StreamerManagerClass(store, affecters);

  return {
    store,
    streamerMg,
    dependencyMg,
  };
};
