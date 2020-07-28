import { useMemo, useState, useEffect } from "react";
import { ApisBase, Dependency, TrelaContextValue } from "../type";

export const useDependency = <S, A extends ApisBase>(
  context: TrelaContextValue<S, A>
): Dependency<S> => {
  const { dependencyMg } = context;

  const [, forceUpdate] = useState({});
  const dependency = useMemo(() => {
    return dependencyMg.createDependency(() => forceUpdate({}));
  }, []);

  dependencyMg.registerDependency(dependency);

  useEffect(() => {
    dependencyMg.updateDependency(dependency);

    return () => {
      dependencyMg.deleteDependency(dependency);
    };
  });

  return dependency;
};
