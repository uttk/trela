import { StreamClass } from "../../src/elements/StreamClass";
import { Affecters, Effect } from "../../src/types";

describe("Stream Class Test", () => {
  const initEffect: Effect = {
    type: "request",
    request: "fetchUser",
    payload: [0],
  };
  let stream: StreamClass;
  let affecters: Affecters;

  beforeEach(() => {
    affecters = {
      request: jest.fn(),
      resolve: jest.fn(),
      cancel: jest.fn(),
      error: jest.fn(),
      done: jest.fn(),
    };

    stream = new StreamClass(initEffect);

    Object.keys(affecters).forEach((key) => {
      const k = key as Effect["type"];
      stream.setAffecter(k, affecters[k]);
    });
  });

  describe("setAffecter", () => {
    test("Can set an affecter", () => {
      const affecterMock = jest.fn();

      const types: Effect["type"][] = [
        "request",
        "resolve",
        "cancel",
        "error",
        "done",
      ];

      types.forEach((type, times) => {
        stream.setAffecter(type, affecterMock);
        stream.send(type);

        expect(affecterMock).toBeCalledTimes(times + 1);
      });
    });
  });

  describe("send function", () => {
    test("Pass the effect to the corresponding affecter", () => {
      stream.send("request");
      stream.send("resolve");
      stream.send("cancel");
      stream.send("error");
      stream.send("done");

      Object.keys(affecters).forEach((key) => {
        const k = key as keyof Affecters;

        expect(affecters[k]).toBeCalled();
        expect(affecters[k]).toBeCalledTimes(1);
      });
    });

    test("Overwrite the running effect", (done) => {
      stream.setAffecter("request", (effect, next) => {
        setTimeout(() => {
          next({ ...effect, type: "resolve" });
        }, 100);
      });

      stream.send("request");
      stream.send("request");

      setTimeout(() => {
        expect(affecters.resolve).toBeCalledTimes(1);
        done();
      }, 300);
    });
  });

  describe("onComplite", () => {
    test("Notify that the process is completed", () => {
      const compliteMock = jest.fn();

      stream.onComplite(compliteMock);

      stream.setAffecter("done", (_, __, done) => {
        done(initEffect);
      });

      stream.send("done");

      expect(compliteMock).toBeCalled();
    });
  });
});
