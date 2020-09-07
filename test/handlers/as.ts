import { Message } from "discord.js";
import { expect } from "chai";
import sinon, { SinonSpy } from "sinon";
const proxyquire = require("proxyquire").noCallThru();

import handlers from "../../src/handlers";

describe("handlers for the as command", function() {
  describe("when the inputs are valid", function() {
    let rollSpy:SinonSpy;
    let stubbedHandler;

    beforeEach(function() {
      rollSpy = sinon.spy();
      stubbedHandler = proxyquire("../../src/handlers", {
        "../rules": { awardStar: rollSpy },
      }).default;
    });

    it("passes the correct inputs to rules.awardStar()", function() {
      stubbedHandler(
        {
          guild: {
            members: {
              cache: [{ user: { username: "Devin" } }],
            },
          },
        },
        "as",
        ["Devin"]
      );
      expect(rollSpy.calledOnce).to.be.true;
      expect(rollSpy.calledWithExactly({ user: { username: "Devin" } })).to.be
        .true;
    });
  });

  describe("when the inputs aren't valid", function() {
    it("throws with a listing of the expected parameters", function() {
      const requestWithTooFewArgs = () => handlers(<Message>{}, "as", []);
      expect(requestWithTooFewArgs).to.throw("{Player Name}");
    });
  });
});
