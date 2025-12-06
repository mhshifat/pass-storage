import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ConnectionCardProps {
    title: string;
    description: string;
}

export default function ConnectionCard({ title, description }: ConnectionCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
        </Card>
    )
}