# Facebook API Query Application

This TypeScript application allows you to continuously query Facebook's API every 2 seconds with the provided access token.

## Prerequisites

- Node.js installed on your machine
- Access token from Facebook's API with appropriate permissions

## Installation

Install dependencies using npm:

```bash
npm install
```

## Usage

Run the application using `ts-node`, providing your Facebook access token as a command line argument:

```bash
ts-node script.ts <access_token>
```

Replace `<access_token>` with your actual Facebook access token.

## Example

```bash
ts-node script.ts ACCESS_TOKEN
```
