import axios from "axios";
import request from "axios";
import {
  parseAppUsage,
  appUsageType,
  fbApiErrorResType,
  parseFbApiErrorResponse,
} from "./util";

const fbErrorCdMap: Record<number, string> = {
  4: "Application request limit reached. Please try again at a later time.",
  17: "User request limit reached. Please try again at a later time.",
  32: "Page request limit reached. Please try again at a later time.",
};

let currentAppUsageMetric: appUsageType;

export async function queryAPI(accessToken: string, debug: boolean) {
  try {
    if (currentAppUsageMetric && debug) {
      console.log(
        `Call count percentage: ${currentAppUsageMetric.call_count}\nTotal CPU time percentage: ${currentAppUsageMetric.total_cputime}\nTotal allotted time percentage: ${currentAppUsageMetric.total_time}`
      );
      if (
        currentAppUsageMetric.call_count >= 95 ||
        currentAppUsageMetric.total_cputime >= 95 ||
        currentAppUsageMetric.total_time >= 95
      ) {
        console.warn("Warning: Approaching API rate limit.");
      }
    }

    const response = await axios.get("https://graph.facebook.com/me", {
      params: {
        access_token: accessToken,
        fields: "id,name,last_name",
      },
    });

    const parsedAppUsage: appUsageType | undefined = parseAppUsage(
      JSON.parse(response.headers["x-app-usage"]),
      debug
    );
    if (parsedAppUsage) {
      currentAppUsageMetric = parsedAppUsage;
    } else {
      if (debug)
        console.warn(
          'WARNING: Error parsing API header "x-app-usage". Please see debug log.'
        );
    }

    console.log("Facebook API Response:", response.data);
  } catch (error) {
    if (request.isAxiosError(error) && error.response) {
      const parsedApiErrorRes: fbApiErrorResType | undefined =
        parseFbApiErrorResponse(error.response.data, debug);
      if (parsedApiErrorRes) {
        const fbErrorCd: number = parsedApiErrorRes.error.code;
        console.error(
          `Error ${error.response.status} querying Facebook API:`,
          fbErrorCdMap[fbErrorCd]
            ? fbErrorCdMap[fbErrorCd]
            : parsedApiErrorRes.error.message
        );
        process.exit(1);
      } else {
        console.error(
          `Error parsing Facebook API error response. ${
            debug
              ? "Please see debug log."
              : 'Please enable debug mode with "-d" to see more details.'
          }`
        );
        process.exit(1);
      }
    } else {
      console.error("Error querying Facebook API:", error);
      process.exit(1);
    }
  }
}
