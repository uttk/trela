import { ApisBase, CreateAction } from "./util";

export interface Store<S, A extends ApisBase> {
  getState(): S;
  updateState(state: S): void;
  getApiKeys(): Array<keyof A>;
  getApi<AK extends keyof A>(key: AK): A[AK];
  subscribe(callback: (state: S) => void): () => void;
  dispatch(action: CreateAction<keyof A, A>): void;
}
