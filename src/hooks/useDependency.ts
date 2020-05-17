import { useMemo, useState, useEffect } from "react";
import { Dependency, TrelaContextValue } from "../types";

export const useDependency = (
  context: TrelaContextValue<any, any>
): Dependency => {
  const [, forceUpdate] = useState({});
  const { dependencyMg } = context;
  const dependency = useMemo(() => {
    return dependencyMg.createDependency(() => {
      forceUpdate({});
    });
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
