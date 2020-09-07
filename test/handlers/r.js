const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const handler = require("../../src/handlers");

describe("handlers for the r command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { roll: rollSpy },
      });
    });

    it("passes the correct inputs to rules.roll()", function() {
      stubbedHandler(
        {
          author: {
            username: "Devin",
          },
        },
        "r",
        ["6"]
      );
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly("Devin", 6)).to.be.true;
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
          "r",
          []
        );
      expect(requestWithTooFewArgs).to.throw("{Player Dice}");
    });
  });
});
