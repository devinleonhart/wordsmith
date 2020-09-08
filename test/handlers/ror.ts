import { Message } from "discord.js";
import { expect } from "chai";
import sinon, { SinonSpy } from "sinon";
const proxyquire = require("proxyquire").noCallThru();

import handlers from "../../src/handlers";

describe("handlers for the ror command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy:SinonSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { rollOpposedRequest: rollSpy },
      }).default;
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
        ["Devin", "5", "4"],
        () => {}
      );
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly({ user: { username: "Devin" } }, 5, 4))
        .to.be.true;
    });
  });

  describe("when the inputs aren't valid", function() {
    it("throws with a listing of the expected parameters", function() {
      const requestWithTooFewArgs = () => handlers(<Message>{}, "ror", ["5"], () => {});
      expect(requestWithTooFewArgs).to.throw(
        "{Player Name} {Player Dice} {Challenge Dice}"
      );
    });
  });
});
