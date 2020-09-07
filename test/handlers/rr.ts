import { expect } from "chai";
import sinon, { SinonSpy } from "sinon";
const proxyquire = require("proxyquire").noCallThru();

describe("handlers for the rr command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy:SinonSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { rollRequest: rollSpy },
      }).default;
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
});
