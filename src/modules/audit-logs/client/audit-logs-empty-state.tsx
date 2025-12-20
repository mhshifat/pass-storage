import { Card, CardContent } from "@/components/ui/card"

export function AuditLogsEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-4"
        >
          <circle cx="100" cy="100" r="80" fill="#F3F4F6" />
          <rect x="60" y="70" width="80" height="60" rx="4" fill="#E5E7EB" />
          <rect x="70" y="80" width="60" height="8" rx="2" fill="#9CA3AF" />
          <rect x="70" y="95" width="45" height="8" rx="2" fill="#9CA3AF" />
          <rect x="70" y="110" width="50" height="8" rx="2" fill="#9CA3AF" />
          <circle cx="85" cy="125" r="3" fill="#9CA3AF" />
          <circle cx="95" cy="125" r="3" fill="#9CA3AF" />
          <circle cx="105" cy="125" r="3" fill="#9CA3AF" />
          <path
            d="M50 50 L30 70 L50 90"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M150 50 L170 70 L150 90"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <h3 className="text-lg font-semibold mb-2">No Audit Logs Found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          There are no audit logs matching your current filters. Try adjusting your search criteria or date range.
        </p>
      </CardContent>
    </Card>
  )
}
