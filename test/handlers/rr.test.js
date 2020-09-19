const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const proxyquire = require("proxyquire").noCallThru();
const handlers = require("../../src/handlers").default;

describe("handlers for the s command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { useStar: rollSpy },
      }).default;
    });

    it("passes the correct inputs to rules.useStar()", function() {
      stubbedHandler({}, "s", ["Devin"]);
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithMatch("Devin")).to.be.true;
    });
  });

  describe("when the inputs aren't valid", function() {
    it("throws with a listing of the expected parameters", function() {
      const requestWithTooFewArgs = () => handlers({}, "s", [], () => {});
      expect(requestWithTooFewArgs).to.throw("{Character Name}");
    });
  });
});
