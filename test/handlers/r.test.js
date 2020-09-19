const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const proxyquire = require("proxyquire").noCallThru();

describe("handlers for the r command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { roll: rollSpy },
      }).default;
    });

    it("passes the correct inputs to rules.roll()", function() {
      stubbedHandler(
        {
          author: {
            username: "Devin",
          },
        },
        "r",
        ["6"],
        () => {}
      );
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly("Devin", 6)).to.be.true;
    });
  });
});
