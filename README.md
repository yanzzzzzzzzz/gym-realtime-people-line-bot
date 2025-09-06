# gym-realtime-people

A simple TypeScript starter project with Line Bot integration for querying gym occupancy.

## Scripts

- `npm run build` — Compile TypeScript
- `npm start` — Run the compiled code
- `npm run dev` — Run in development mode with nodemon
- `npm test` — Run tests

## Line Bot Setup

1. Create a Line Bot channel at https://developers.line.biz/
2. Set the webhook URL to `https://your-domain.com/webhook`
3. Set environment variables:
   - `LINE_CHANNEL_ACCESS_TOKEN`: Your channel access token
   - `LINE_CHANNEL_SECRET`: Your channel secret

## Usage

- GET `/health` — Health check
- GET `/api/people` — Get all gym occupancy data
- POST `/webhook` — Line Bot webhook for handling messages

When a user sends a message like "南港", the bot will reply with the current occupancy of 南港運動中心.
