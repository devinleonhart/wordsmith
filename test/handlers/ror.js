const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const handler = require("../../src/handlers");

describe("handlers for the ror command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { rollOpposedRequest: rollSpy },
      });
    });

    it("passes the correct inputs to rules.rollOpposedRequest()", function() {
      stubbedHandler(
        {
          guild: {
            members: {
              cache: [{ user: { username: "Devin" } }],
            },
          },
        },
        "ror",
        ["Devin", "5", "4"]
      );
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly({ user: { username: "Devin" } }, 5, 4))
        .to.be.true;
    });
  });

  describe("when the inputs aren't valid", function() {
    it("throws with a listing of the expected parameters", function() {
      const requestWithTooFewArgs = () => handler({}, "ror", ["5"]);
      expect(requestWithTooFewArgs).to.throw(
        "{Player Name} {Player Dice} {Challenge Dice}"
      );
    });
  });
});
