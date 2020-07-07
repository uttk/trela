import { createDispacher } from "./createDiscpacher";
import { createSimpleFlow } from "./flows/createSimpleFlow";
import { ApisBase, WrapApis, TrelaContextValue } from "../types";

export const createWrapApis = <S, A extends ApisBase>(
  context: TrelaContextValue<S, A>
): WrapApis<S, A> => {
  const { apis } = context;

  return Object.keys(apis || {}).reduce<WrapApis<S, A>>((wrapApis, request) => {
    return {
      ...wrapApis,

      [request]: (...payload: any[]) => {
        const dispacher = createDispacher(context, request, payload);
        const flow = context.flows.find((v) => v.id === dispacher.id);

        return flow || createSimpleFlow(context, dispacher);
      },
    };
  }, {} as WrapApis<S, A>);
};
