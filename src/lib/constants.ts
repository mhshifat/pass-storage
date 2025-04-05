export const ROUTE_PATHS = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  ORGANIZATIONS: "/organizations",
  ORGANIZATION_TEAMS(id: string) {
    return `/organizations/${id}/teams`
  },
  TEAM_DETAILS(orgId: string, teamId: string) {
    return `/organizations/${orgId}/teams/${teamId}`
  },
  ORGANIZATION_MEMBERS(id: string) {
    return `/organizations/${id}/members`
  },
  SIGN_UP: "/sign-up",
  SIGN_IN: "/sign-in",
}
