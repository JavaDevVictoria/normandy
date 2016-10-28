/* global exports:true */
const {Cu} = require("chrome");
const testRunner = require("sdk/test");
const {before} = require("sdk/test/utils");

const {NormandyDriver} = require("../lib/NormandyDriver.js");
const {makeSandbox} = require("../lib/Sandbox.js");

let eventEmitter;

exports["test it works"] = (assert, done) => {
  eventEmitter.on("foo", () => done());
  eventEmitter.emit("foo");
};

exports["test it fires events async"] = (assert, done) => {
  let flag = 0;
  eventEmitter.on("foo", () => {
    flag += 1;
    assert.equal(flag, 1);
    done();
  });
  assert.equal(flag, 0);
  eventEmitter.emit("foo");
  assert.equal(flag, 0);
};

exports["test it can safely fire events with no listeners"] = () => {
  eventEmitter.emit("foo");
};

exports["test it passes arguments"] = (assert, done) => {
  eventEmitter.on("foo", arg => {
    assert.equal(arg, "it works");
    done();
  });
  eventEmitter.emit("foo", "it works");
};

exports["test it works with multiple listeners in order"] = (assert, done) => {
  let counter = 0;

  eventEmitter.on("foo", () => {
    counter += 1;
    assert.equal(counter, 1);
  });

  eventEmitter.on("foo", () => {
    counter += 10;
    assert.equal(counter, 11);
    done();
  });

  eventEmitter.emit("foo");
};

exports["test off() works"] = (assert, done) => {

  let count = 0;
  function cb1() {
    count += 1;
  }
  function cb2() {
    count += 10;
    eventEmitter.off("foo", cb2);
  }
  function allDone() {
    assert.equal(count, 12);
    done();
  }

  eventEmitter.on("foo", cb1);
  eventEmitter.on("foo", cb2);
  eventEmitter.on("done", allDone);

  eventEmitter.emit("foo");
  eventEmitter.emit("foo");
  eventEmitter.emit("done");
};

exports["test once() works"] = (assert, done) => {
  let count = 0;
  function cb() {
    count += 1;
  }
  function allDone() {
    assert.equal(count, 1);
    done();
  }

  eventEmitter.on("done", allDone);
  eventEmitter.once("foo", cb);

  eventEmitter.emit("foo");
  eventEmitter.emit("foo");
  eventEmitter.emit("done");
};

before(exports, () => {
  let sandbox = makeSandbox();
  let driver = new NormandyDriver(sandbox, {});
  eventEmitter = new sandbox.EventEmitter(Cu.cloneInto(driver, sandbox, {cloneFunctions: true}));
});

testRunner.run(exports);
