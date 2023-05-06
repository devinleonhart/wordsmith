import { readdirSync } from "fs";
import { resolve } from "path";
import { Client } from "discord.js";

module.exports = (client: Client) => {
  client.handleComponents = async () => {
    const componentFolders = readdirSync(
      resolve(__dirname, "../../components")
    );
    for (const folder of componentFolders) {
      const componentFiles = readdirSync(
        resolve(__dirname, `../../components/${folder}`)
      );

      switch (folder) {
        case "selectMenus":
          for (const file of componentFiles) {
            const selectMenu = require(resolve(
              __dirname,
              `../../components/${folder}/${file}`
            ));
            client.selectMenus.set(selectMenu.data.name, selectMenu);
          }
          break;

        default:
          break;
      }
    }
  };
};
