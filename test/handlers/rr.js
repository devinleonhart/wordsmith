const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();

const handler = require("../../src/handlers");

describe("handlers for the rr command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { rollRequest: rollSpy },
      });
    });

    it("passes the correct inputs to rules.rollRequest()", function() {
      stubbedHandler(
        {
          guild: {
            members: {
              cache: [{ user: { username: "Devin" } }],
            },
          },
        },
        "rr",
        ["Devin", "5"]
      );
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly({ user: { username: "Devin" } }, 5)).to
        .be.true;
    });
  });

  describe("when the inputs aren't valid", function() {
    it("throws with a listing of the expected parameters", function() {
      const requestWithTooFewArgs = () =>
        handler(
          {
            guild: {
              members: {
                cache: [{ user: { username: "Devin" } }],
              },
            },
          },
          "rr",
          ["5"]
        );
      expect(requestWithTooFewArgs).to.throw("{Player Name} {Player Dice}");
    });
  });
});
