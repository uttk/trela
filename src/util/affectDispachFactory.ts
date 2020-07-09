import {
  Effect,
  ApisBase,
  Affecters,
  EffectTypes,
  CreateDispach,
} from "../types";

const createAffect = <A extends ApisBase>(
  affecters: Affecters<Effect<A>>,
  callbacks: Array<() => void>
) => {
  let currentEffect: Effect<A> | null = null;

  const affect = <E extends EffectTypes>(
    effect: Effect<A, E>,
    oldEffect: Effect<A> | null
  ): E => {
    if (currentEffect !== oldEffect) return effect.type;

    currentEffect = effect;

    const affecter = affecters[effect.type];

    if (affecter) {
      affecter(
        effect,
        (nextEffect) => affect(nextEffect, effect),
        () => callbacks.forEach((f) => f())
      );

      return effect.type;
    }

    throw new Error(
      "The Affecter corresponding to the passed Effect is not set. passed effect : " +
        JSON.stringify(effect)
    );
  };

  return { affect, currentEffect };
};

export const affectDispachFactory = <A extends ApisBase, AK extends keyof A>(
  request: AK,
  payload: Parameters<A[AK]>
): CreateDispach<any, A> => {
  return (context, callbacks) => {
    const effect: Effect<A> = { type: "request", request, payload };
    const { affect, currentEffect } = createAffect(
      context.affecters,
      callbacks
    );

    return ({ status, payload }) => {
      switch (status) {
        case "started":
          affect({ ...effect, type: "request" }, currentEffect);
          break;

        case "cancel":
          affect({ ...effect, type: "cancel", payload }, currentEffect);
          break;

        case "error":
          affect({ ...effect, type: "error", payload }, currentEffect);
          break;

        case "finished":
          affect({ ...effect, type: "done", payload }, currentEffect);
          break;
      }
    };
  };
};
