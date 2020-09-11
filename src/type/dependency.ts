export type DependencyId = number;

export interface Dependency {
  readonly id: DependencyId;
  readonly updateComponentView: () => void;

  didMount: boolean;
  parents: Map<Dependency["id"], Dependency>;
}
