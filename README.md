# Facebook API Query Application

This TypeScript and Node.js application allows you to query Facebook's API at a 2-second interval. It takes a mandatory command-line input for an access token, and an optional debug flag to enable debug logs and more detailed error messages. 

Additionally, it provides a warning message when approaching the API rate limit (with debug mode enabled).

When an error occurs (such as an invalid access token or when rate limit is reached), the program will display the corresponding error message and terminate (only with non-rate-limit related errors). 

When rate limit related errors occur, by default, the program will implement a back-off strategy with a default interval starting at 30 seconds, after 5 unsuccessful retries, it will increase the interval by 30 seconds. 

## Prerequisites

- Node.js installed on your machine
- Access token from Facebook's API with appropriate permissions

## Installation

Install dependencies using npm:

```bash
npm install
```

## Options

- `-a, --access-token`: Mandatory. Specifies the Facebook access token.
- `-d, --debug`: Optional. Enables debug mode to display more detailed error messages and rate limit warnings.
- `-h, --help`: Display help message.

## Usage

Run the application using `ts-node`, providing your Facebook access token as a command line argument:

```bash
ts-node ./main.ts -a <access_token>
```

With the optional debug flag:
```bash
ts-node ./main.ts -a <access_token> -d
```

Replace `<access_token>` with your actual Facebook access token.

## Note

By default, the back-off interval starts at 30 seconds, after the maximum number of 5 retries, it will increase the back-off interval by 30 seconds. 

These values can be modified from within the `queryAPI.ts` file:

- `defaultIntervalIncrement`: The amount of time (in milliseconds) to add to the back-off interval after a set amount of failed retries (default 30000ms/30s)
- `maxRetries`: The maximum number of retries before increasing the back-off interval (default is 5 retries)
- `defaultInterval`: If you wish to adjust the default API query interval on success, modify this value accordingly (default is 2000ms/2s)

