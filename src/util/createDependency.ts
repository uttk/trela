import { Dependency } from "../types";

let counter = 0;

export const createDependency = (
  updateComponentView: () => void
): Dependency => {
  const dependency: Dependency = {
    id: counter++,
    didMount: false,
    parents: [],
    selectors: [],
    updateComponentView,

    init: () => {
      dependency.didMount = false;
      dependency.selectors = [];
    },
  };

  return dependency;
};
