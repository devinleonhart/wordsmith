const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const handler = require("../../src/handlers");

describe("handlers for the s command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { useStar: rollSpy },
      });
    });

    it("passes the correct inputs to rules.useStar()", function() {
      stubbedHandler({ author: { username: "Devin" } }, "s", []);
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly("Devin")).to.be.true;
    });
  });

  describe("when the inputs aren't valid", function() {
    it("throws with a listing of the expected parameters", function() {
      const requestWithTooFewArgs = () => handler({}, "s", ["5"]);
      expect(requestWithTooFewArgs).to.throw("Expected no arguments.");
    });
  });
});
