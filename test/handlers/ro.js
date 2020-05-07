const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const handler = require("../../src/handlers");

describe("handlers for the ro command", () => {
  describe("when the inputs are valid", () => {
    let rollOpposedSpy;
    let stubbedHandler;

    beforeEach(() => {
      rollOpposedSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { rollOpposed: rollOpposedSpy },
      });
    });

    it("passes the correct inputs to rules.rollOpposed()", () => {
      stubbedHandler("ro", ["6", "5", "4", "3"]);
      expect(rollOpposedSpy.calledOnce).to.be.true;
      expect(rollOpposedSpy.calledWithExactly(6, 5, 4, 3)).to.be.true;
    });
  });

  describe("when the inputs aren't valid", () => {
    it("throws with a listing of the expected parameters", () => {
      const requestWithTooFewArgs = () => handler("ro", ["5", "6"]);
      expect(requestWithTooFewArgs).to.throw(
        "{dicepool} {limit} {opposedDicepool} {opposedLimit}"
      );
    });
  });
});
