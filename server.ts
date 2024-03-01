import axios from "axios";
import request from "axios";

async function queryAPI(accessToken: string) {
  try {
    const response = await axios.get("https://graph.facebook.com/me", {
      params: {
        access_token: accessToken,
        fields: "id,name,last_name",
      },
    });
    console.log("Facebook API Response:", response.data);
  } catch (error) {
    if (request.isAxiosError(error) && error.response) {
      console.error(
        `Error ${error.response.status} querying Facebook API:`,
        error.response.data
      );
    } else {
      console.error("Error querying Facebook API:", error);
    }
  }
}

if (process.argv.length !== 3) {
  console.error("Please follow the format: ts-node server.ts <access_token>");
  process.exit(1);
}

const accessToken = process.argv[2];

setInterval(() => {
  queryAPI(accessToken);
}, 2000);
