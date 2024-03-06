import * as t from "io-ts";
import { withMessage } from "io-ts-types";

const appUsageSchema = t.type({
  call_count: t.number,
  total_cputime: t.number,
  total_time: t.number,
});

const fbApiErrorResponse = t.type({
  error: t.type({
    message: t.string,
    type: t.string,
    code: t.number,
    fbtrace_id: t.string,
  }),
});

const decodeAppUsage = t.exact(
  t.type({
    call_count: withMessage(t.number, () => "call_count must be a number"),
    total_cputime: withMessage(
      t.number,
      () => "total_cputime must be a number"
    ),
    total_time: withMessage(t.number, () => "total_time must be a number"),
  })
);

function parseAppUsage(
  data: unknown,
  debug: boolean
): appUsageType | undefined {
  const validationResult = decodeAppUsage.decode(data);
  if (validationResult._tag === "Right") {
    return validationResult.right;
  } else {
    if (debug) console.error("Error parsing data:", validationResult.left);
    return undefined;
  }
}

const decodeApiError = t.exact(
  t.type({
    error: t.exact(
      t.type({
        message: withMessage(t.string, () => "'message' must be a string"),
        type: withMessage(t.string, () => "'type' must be a string"),
        code: withMessage(t.number, () => "'code' must be a number"),
        fbtrace_id: withMessage(
          t.string,
          () => "'fbtrace_id' must be a string"
        ),
      })
    ),
  })
);

function parseFbApiErrorResponse(
  data: unknown,
  debug: boolean
): fbApiErrorResType | undefined {
  const validationResult = decodeApiError.decode(data);
  if (validationResult._tag === "Right") {
    return validationResult.right;
  } else {
    if (debug) console.error(validationResult.left);
    return undefined;
  }
}

type appUsageType = t.TypeOf<typeof appUsageSchema>;
type fbApiErrorResType = t.TypeOf<typeof fbApiErrorResponse>;

export {
  parseAppUsage,
  parseFbApiErrorResponse,
  appUsageType,
  fbApiErrorResType,
};
