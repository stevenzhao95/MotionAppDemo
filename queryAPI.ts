import axios, { AxiosError, AxiosResponse } from "axios";
import request from "axios";
import {
  parseAppUsage,
  appUsageType,
  fbApiErrorResType,
  parseFbApiErrorResponse,
} from "./util";

const rateLimitErrorCdMap: Record<number, string> = {
  4: "Application request limit reached.",
  17: "User request limit reached.",
  32: "Page request limit reached.",
};

const maxRetries = 5;
const defaultInterval = 500;
let currentAppUsageMetric: appUsageType;
let backoffInterval = 30000;

const displayAppUsage = (
  response: AxiosResponse | AxiosError,
  debug: boolean
) => {
  if (debug) {
    const parsedAppUsage: appUsageType | undefined = parseAppUsage(
      JSON.parse(
        request.isAxiosError(response)
          ? response.response?.headers["x-app-usage"]
          : response.headers["x-app-usage"]
      ),
      debug
    );

    if (parsedAppUsage) {
      currentAppUsageMetric = parsedAppUsage;
      console.log(
        `Call count percentage: ${currentAppUsageMetric.call_count}%\nTotal CPU time percentage: ${currentAppUsageMetric.total_cputime}%\nTotal allotted time percentage: ${currentAppUsageMetric.total_time}%`
      );
      if (
        currentAppUsageMetric.call_count >= 100 ||
        currentAppUsageMetric.total_cputime >= 100 ||
        currentAppUsageMetric.total_time >= 100
      ) {
        console.warn("Warning: Exceeded API rate limit.");
      } else if (
        currentAppUsageMetric.call_count >= 95 ||
        currentAppUsageMetric.total_cputime >= 95 ||
        currentAppUsageMetric.total_time >= 95
      ) {
        console.warn("Warning: Approaching API rate limit.");
      }
    } else {
      if (debug)
        console.warn(
          'WARNING: Error parsing API header "x-app-usage". Please see debug log.'
        );
    }
  }
};

export async function queryAPI(
  accessToken: string,
  debug: boolean,
  retries: number = 0
) {
  try {
    const response = await axios.get("https://graph.facebook.com/me", {
      params: {
        access_token: accessToken,
        fields: "id,name,last_name",
      },
    });

    displayAppUsage(response, debug);

    console.log("Facebook API Response:", response.data);
  } catch (error) {
    if (request.isAxiosError(error) && error.response) {
      displayAppUsage(error, debug);

      const parsedApiErrorRes: fbApiErrorResType | undefined =
        parseFbApiErrorResponse(error.response.data, debug);
      if (parsedApiErrorRes) {
        const fbErrorCd: number = parsedApiErrorRes.error.code;

        // check if error is rate limit related
        // if so, implement back-off strategy
        if (rateLimitErrorCdMap[fbErrorCd]) {
          console.error(
            `Error: ${rateLimitErrorCdMap[fbErrorCd]} Retrying in ${
              backoffInterval / 1000
            } seconds`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffInterval));
          retries++;

          if (retries >= maxRetries) {
            backoffInterval += 30000;
            retries = 0;
          }
          return queryAPI(accessToken, debug, retries);
        }

        console.error(
          `Error ${error.response.status} querying Facebook API:`,
          parsedApiErrorRes.error.message
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
  await new Promise((resolve) => setTimeout(resolve, defaultInterval));
  return queryAPI(accessToken, debug, retries);
}
