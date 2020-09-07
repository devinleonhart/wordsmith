const expect = require("chai").expect;

const handler = require("../../src/handlers");

describe("main handler", function() {
  describe("when an unknown command is requested", function() {
    it("throws with a message indicating the command doesn't exist", function() {
      const requestNonexistent = () => handler({}, "fuggle", []);
      expect(requestNonexistent).to.throw("fuggle isn't a recognized command.");
    });
  });

  describe("when the command is \"help\"", function() {
    it("returns a listing of available commands", function() {
      expect(handler({}, "help", [])).to.have.string("Available commands:");
    });
  });
});
