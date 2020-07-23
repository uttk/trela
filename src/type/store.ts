import { ApisBase, CreateAction } from "./util";

export interface Store<S, A extends ApisBase> {
  getState(): S;
  getApi<AK extends keyof A>(key: AK): A[AK];
  updateState(state: S): void;
  subscribe(callback: (state: S) => void): () => void;
  dispatch<AK extends keyof A>(action: CreateAction<A, AK>): S;
}
