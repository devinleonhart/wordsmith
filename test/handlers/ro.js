const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const handler = require("../../src/handlers");

describe("handlers for the ro command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { rollOpposed: rollSpy },
      });
    });

    it("passes the correct inputs to rules.rollOpposed()", function() {
      stubbedHandler(
        {
          author: {
            username: "Devin",
          },
        },
        "ro",
        ["6", "5"]
      );
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly("Devin", 6, 5)).to.be.true;
    });
  });

  describe("when the inputs aren't valid", function() {
    it("throws with a listing of the expected parameters", function() {
      const requestWithTooFewArgs = () =>
        handler(
          {
            author: {
              username: "Devin",
            },
          },
          "ro",
          ["5"]
        );
      expect(requestWithTooFewArgs).to.throw("{Player Dice} {Challenge Dice}");
    });
  });
});
