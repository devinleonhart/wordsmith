const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const handler = require("../../src/handlers");

describe("handlers for the r command", () => {
  describe("when the inputs are valid", () => {
    let rollSpy;
    let stubbedHandler;

    beforeEach(() => {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { roll: rollSpy },
      });
    });

    it("passes the correct inputs to rules.roll()", () => {
      stubbedHandler("r", ["6", "5", "4"]);
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly(6, 5, 4)).to.be.true;
    });
  });

  describe("when the inputs aren't valid", () => {
    it("throws with a listing of the expected parameters", () => {
      const requestWithTooFewArgs = () => handler("r", ["5", "6"]);
      expect(requestWithTooFewArgs).to.throw("{dicepool} {threshold} {limit}");
    });
  });
});
