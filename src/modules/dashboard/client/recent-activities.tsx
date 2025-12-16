"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Activity {
  user: string
  action: string
  resource: string
  time: string
  avatar: string
}

interface RecentActivitiesProps {
  activities: Activity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>
          Latest actions performed by users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.avatar} alt={activity.user} />
                <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">
                    {activity.user}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.action} • {activity.resource}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
