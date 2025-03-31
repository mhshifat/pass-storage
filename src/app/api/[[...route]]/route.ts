import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import authApi from './auth';

const app = new Hono().basePath('/api');

export const routes = app
  .route("/auth", authApi)

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes;
