import { ApisBase } from "../type";
import { Flow } from "../type/flow";

export const createApiRequest = <S, A extends ApisBase, AK extends keyof A>(
  request: AK,
  payload: Parameters<A[AK]>
) => {
  return (flow: Flow<S, A>) => {
    const store = flow.getStore();
    const api = store.getApi(request);

    api(...payload)
      .then((result) => {
        store.dispatch({ type: request, payload: result });
        flow.complete();
      })
      .catch(flow.error);
  };
};
