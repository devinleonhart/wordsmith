import { Message } from "discord.js";
import { expect } from "chai";

import handlers from "../../src/handlers";

describe("main handler", function() {
  describe("when an unknown command is requested", function() {
    it("throws with a message indicating the command doesn't exist", function() {
      const requestNonexistent = () => handlers(<Message>{}, "fuggle", []);
      expect(requestNonexistent).to.throw("fuggle isn't a recognized command.");
    });
  });

  describe("when the command is \"help\"", function() {
    it("returns a listing of available commands", function() {
      expect(handlers(<Message>{}, "help", [])).to.have.string("Available commands:");
    });
  });
});
