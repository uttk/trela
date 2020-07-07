import {
  Effect,
  ApisBase,
  Dispacher,
  EffectTypes,
  CompliteFunc,
  TrelaContextValue,
} from "../types";

export const createDispacher = <A extends ApisBase>(
  context: TrelaContextValue<any, A>,
  request: string,
  defaultPayload: any[]
): Dispacher => {
  const compliteCallbacks: Set<CompliteFunc> = new Set();
  let currentEffect: Effect<A, keyof A> | null = null;

  const affect = (
    effect: Effect<A, keyof A>,
    oldEffect: null | Effect<A, keyof A>
  ) => {
    if (currentEffect !== oldEffect) return;

    currentEffect = effect;

    if (context.affecters) {
      const affecter = context.affecters[effect.type];

      affecter(
        effect,
        (nextEffect) => affect(nextEffect, effect),
        () => void 0
      );
    }
  };

  return {
    id: JSON.stringify(defaultPayload),

    onComplite: (callback: CompliteFunc) => {
      compliteCallbacks.add(callback);

      return () => compliteCallbacks.delete(callback);
    },

    dispatch: (type: EffectTypes, payload?: any) => {
      affect(
        {
          type,
          request,
          payload: payload === void 0 ? defaultPayload : payload,
        },
        currentEffect
      );
    },
  };
};
