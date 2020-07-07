import { useMemo, useState, useEffect } from "react";
import { createDependency } from "../util/createDependency";
import { Dependency } from "../types";

export const useDependency = (
  dependencies: Map<Dependency["id"], Dependency>
): Dependency => {
  const [, forceUpdate] = useState({});
  const dependency = useMemo(() => {
    return createDependency(() => forceUpdate({}));
  }, []);

  if (!dependencies.has(dependency.id)) {
    const allDepdendencies = [...dependencies.values()];
    const parents = allDepdendencies.filter((dep) => !dep.didMount);

    dependency.parents = parents;
  }

  dependency.init();
  dependencies.set(dependency.id, dependency);

  useEffect(() => {
    if (dependencies.has(dependency.id)) {
      dependency.parents = dependency.parents.filter((p) => !p.didMount);
    }

    dependency.didMount = true;
    dependencies.set(dependency.id, dependency);

    return () => {
      dependencies.delete(dependency.id);
    };
  });

  return dependency;
};
