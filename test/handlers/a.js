const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const handler = require("../../src/handlers");

describe("handler for the a command", () => {
  describe("when the inputs are valid", () => {
    let availabilitySpy;
    let stubbedHandler;

    beforeEach(() => {
      availabilitySpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": {
          availability: availabilitySpy,
        },
      });
    });

    it("passes the correct inputs to rules.availability()", () => {
      stubbedHandler("a", ["7", "6", "5", "4"]);
      expect(availabilitySpy.calledOnce).to.be.true;
      expect(availabilitySpy.calledWithExactly(7, 6, 5, 4)).to.be.true;
    });
  });

  describe("when the inputs aren't valid", () => {
    it("throws with a listing of the expected parameters", () => {
      const requestWithTooFewArgs = () => handler("a", ["5", "6"]);
      expect(requestWithTooFewArgs).to.throw(
        "Expected {Availability} {CHA} {Negotiate} {Social Limit}"
      );
    });
  });
});
