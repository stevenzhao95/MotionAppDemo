import * as yargs from "yargs";
import { queryAPI } from "./queryAPI";

type Arguments = {
  accessToken: string;
  debug?: boolean;
};

const argv = yargs
  .options({
    "access-token": {
      alias: "a",
      description: "Facebook access token (mandatory)",
      demandOption: true,
      type: "string",
    },
    debug: {
      alias: "d",
      description: "Enable debug mode (optional)",
      type: "boolean",
    },
  })
  .help()
  .version("1.0.0")
  .alias("version", "v")
  .alias("help", "h").argv as unknown as Arguments;

function main() {
  const accessToken: string = argv.accessToken;
  const debug: boolean = argv.debug || false;
  setInterval(() => {
    queryAPI(accessToken, debug);
  }, 2000);
}

main();
