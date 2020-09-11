import { FlowApi, FlowDispatch, GetFlowApiResultList } from "../../type";

export const cancelablePromise = <R>(
  promise: Promise<R>
): [Promise<R | null>, () => void] => {
  let cancelCallback: () => void = () => void 0;

  const cancelPromise = new Promise<null>((callback) => {
    cancelCallback = () => callback(null);
  });

  return [Promise.race([cancelPromise, promise]), cancelCallback];
};

export const createSeriesPromise = async <FL extends readonly FlowApi<any>[]>(
  flowApiList: FL,
  dispatch: FlowDispatch
): Promise<GetFlowApiResultList<FL> | null> => {
  const results = [];

  for (const index in flowApiList) {
    const flow = dispatch({
      ...flowApiList[index].getRequest(),
      action: "start",
      fromDependency: null,
    });

    const result = await flow.promise;

    if (result === null) return null;

    results.push(result);
  }

  return (results as unknown) as GetFlowApiResultList<FL>;
};

export const createParallelPromise = async <FL extends readonly FlowApi<any>[]>(
  flowApiList: FL,
  dispatch: FlowDispatch
): Promise<GetFlowApiResultList<FL> | null> => {
  const results = await Promise.all(
    flowApiList.map((flowApi) => {
      return dispatch({
        ...flowApi.getRequest(),
        action: "start",
        fromDependency: null,
      }).promise;
    })
  );

  for (const index in results) {
    if (results[index] === null) return null;
  }

  return (results as unknown) as GetFlowApiResultList<FL>;
};
