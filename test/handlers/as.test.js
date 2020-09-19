const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const proxyquire = require("proxyquire").noCallThru();
const handlers = require("../../src/handlers").default;

describe("handlers for the as command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { awardStar: rollSpy },
      }).default;
    });

    it("passes the correct inputs to rules.awardStar()", function() {
      stubbedHandler(
        {},
        "as",
        ["Devin"],
        () => {}
      );
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithMatch("Devin")).to.be
        .true;
    });
  });

  describe("when the inputs aren't valid", function() {
    it("throws with a listing of the expected parameters", function() {
      const requestWithTooFewArgs = () => handlers({}, "as", [], ()=> {}); // eslint-disable-line @typescript-eslint/no-empty-function
      expect(requestWithTooFewArgs).to.throw("{Character Name}");
    });
  });
});
