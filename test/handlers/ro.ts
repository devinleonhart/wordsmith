import { expect } from "chai";
import sinon, { SinonSpy } from "sinon";
const proxyquire = require("proxyquire").noCallThru();

describe("handlers for the ro command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy:SinonSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { rollOpposed: rollSpy },
      }).default;
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
});
