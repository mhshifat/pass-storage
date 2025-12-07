import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectCardProps {
    title: string;
    description: string | null;
}

export default function ProjectCard({ title, description }: ProjectCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
        </Card>
    )
}