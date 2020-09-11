import { TrelaProvider } from "./components/Provider";
import * as AppTypes from "./type";
import { createTrelaContext } from "./util/createTrelaContext";

namespace Trela {
  export const Provider = TrelaProvider;

  export const createContext = createTrelaContext;

  /* eslint-disable prettier/prettier */

  // trela
  export type TrelaApi<A extends ApisBase> = AppTypes.TrelaApi<A>;
  export type TrelaContext<A extends ApisBase> = AppTypes.TrelaContext<A>;
  export type TrelaContextValue<A extends ApisBase> = AppTypes.TrelaContextValue<A>;
  export type TrelaContextOptions<A extends ApisBase> = AppTypes.TrelaContextOptions<A>;

  // utils
  export type ApisBase = AppTypes.ApisBase;
  export type ExcludeNull<T> = AppTypes.ExcludeNull<T>;
  export type ResolvePromise<A extends ApisBase[string]> = AppTypes.ResolvePromise<A>;
  export type CreateApiRequest<A extends ApisBase, AK extends keyof A> = AppTypes.CreateApiRequest<A, AK>;

  /* eslint-enable prettier/prettier */
}

export {
  // trela
  TrelaApi,
  TrelaContext,
  TrelaContextValue,
  TrelaContextOptions,
  // utility
  ApisBase,
  ExcludeNull,
  ResolvePromise,
  CreateApiRequest,
} from "./type";

export { TrelaProvider, createTrelaContext };

export default Trela;
