import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import authApi from './auth';
import tokenApi from './token';
import organizationApi from './organization';
import teamApi from './team';

const app = new Hono().basePath('/api');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/auth", authApi)
  .route("/tokens", tokenApi)
  .route("/organizations", organizationApi)
  .route("/teams", teamApi)

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes;
