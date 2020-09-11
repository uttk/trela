import { useMemo, useState, useEffect } from "react";
import {
  createDependency,
  deleteDependency,
  updateDependency,
  registerDependency,
} from "../elements/dependency";
import { Dependency, DependencyStore } from "../type";

export const useDependency = (store: DependencyStore): Dependency => {
  const [, forceUpdate] = useState({});
  const dependency = useMemo<Dependency>(() => {
    return createDependency(() => forceUpdate({}));
  }, []);

  registerDependency(store, dependency);

  useEffect(() => {
    updateDependency(store, dependency);

    return () => {
      deleteDependency(store, dependency);
    };
  });

  return dependency;
};
