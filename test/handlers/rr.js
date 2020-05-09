const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const handler = require("../../src/handlers");

describe("handlers for the rr command", () => {
  describe("when the inputs are valid", () => {
    let rollSpy;
    let stubbedHandler;

    beforeEach(() => {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { rollRequest: rollSpy },
      });
    });

    it("passes the correct inputs to rules.rollRequest()", () => {
      stubbedHandler({}, "rr", ["Devin", "5", "4"]);
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly("Devin", 5, 4)).to.be.true;
    });
  });

  describe("when the inputs aren't valid", () => {
    it("throws with a listing of the expected parameters", () => {
      const requestWithTooFewArgs = () => handler({}, "rr", ["5"]);
      expect(requestWithTooFewArgs).to.throw(
        "{Player Name} {Player Dice} {Challenge Dice}"
      );
    });
  });
});
