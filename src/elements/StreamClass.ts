import { Stream, Effect, Affecter, CompliteFunc } from "../types";

export class StreamClass implements Stream {
  private initEffect: Effect;
  private currentEffect: null | Effect = null;
  private affecters: Map<string, Affecter> = new Map();
  private compliteCallbacks: Array<CompliteFunc> = [];

  public readonly id: string;

  constructor(initEffect: Effect) {
    let json = JSON.stringify(initEffect.payload);

    if (json.length === 2) json = "";

    this.id = initEffect.request + json;
    this.initEffect = initEffect;
  }

  private complite(effect: Effect) {
    this.compliteCallbacks.forEach((cb) => cb(effect));
  }

  private affect(effect: Effect, oldEffect: null | Effect) {
    if (this.currentEffect !== oldEffect) return;

    this.currentEffect = effect;

    const affecter = this.affecters.get(effect.type);

    if (affecter) {
      affecter(
        effect,
        (nextEffect) => this.affect(nextEffect, effect),
        this.complite.bind(this)
      );

      return;
    }

    throw new Error(
      "The Affecter corresponding to the passed Effect is not set. passed effect : " +
        JSON.stringify(effect)
    );
  }

  setAffecter(type: Effect["type"], affecter: Affecter) {
    this.affecters.set(type, affecter);
  }

  onComplite(callback: CompliteFunc): () => void {
    this.compliteCallbacks.push(callback);

    return () => {
      this.compliteCallbacks = this.compliteCallbacks.filter(
        (v) => v !== callback
      );
    };
  }

  send(type: Effect["type"], payload?: any) {
    const { request, payload: initPayload } = this.initEffect;

    payload = payload === void 0 ? initPayload : payload;

    this.affect({ type, request, payload }, this.currentEffect);
  }
}
