import { Message } from "discord.js";
import { expect } from "chai";
import sinon, { SinonSpy } from "sinon";
const proxyquire = require("proxyquire").noCallThru();

import handlers from "../../src/handlers";

describe("handlers for the s command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy:SinonSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { useStar: rollSpy },
      }).default;
    });

    it("passes the correct inputs to rules.useStar()", function() {
      stubbedHandler({ author: { username: "Devin" } }, "s", []);
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly("Devin")).to.be.true;
    });
  });

  describe("when the inputs aren't valid", function() {
    it("throws with a listing of the expected parameters", function() {
      const requestWithTooFewArgs = () => handlers(<Message>{}, "s", ["5"]);
      expect(requestWithTooFewArgs).to.throw("Expected no arguments.");
    });
  });
});
