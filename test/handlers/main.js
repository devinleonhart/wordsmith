const expect = require("chai").expect;

const settings = require("../../src/settings.js");
const handler = require("../../src/handlers");

describe("main handler", () => {
  describe("when an unknown command is requested", () => {
    it("throws with a message indicating the command doesn't exist", () => {
      const requestNonexistent = () => handler("fuggle", []);
      expect(requestNonexistent).to.throw("fuggle isn't a recognized command.");
    });
  });

  describe('when the command is "help"', () => {
    it("returns a listing of available commands", () => {
      expect(handler("help", [])).to.have.string("Available commands:");
    });
  });
});
