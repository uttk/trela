import {
  FlowId,
  Dependency,
  DependencyId,
  RelationStore,
  DependencyStore,
} from "../../type";
import { getDependencies } from "../dependency";

export const createRelationStore = (
  dependencyStore: DependencyStore
): RelationStore => {
  return {
    dependencyStore,
    updateRelation: new Map(),
  };
};

export const addUpdateRelation = (
  store: RelationStore,
  flowId: FlowId,
  dependencyId: DependencyId
) => {
  const { updateRelation } = store;

  const depIds = updateRelation.get(flowId) || new Set();

  updateRelation.set(flowId, depIds.add(dependencyId));
};

export const tryUpdateComponentView = (
  relationStore: RelationStore,
  flowId: FlowId
) => {
  const { updateRelation, dependencyStore } = relationStore;
  const depIds = updateRelation.get(flowId);

  if (!depIds) return;

  getDependencies(dependencyStore, [...depIds])
    .sort((a, b) => (a.parents.size > b.parents.size ? 1 : -1))
    .reduce<Dependency[]>((list, dep) => {
      let len = list.length;

      while (len--) {
        if (dep.parents.has(list[len].id)) return list;
      }

      return dep.didMount ? list.concat(dep) : list;
    }, [])
    .forEach((dep) => dep.updateComponentView());
};
