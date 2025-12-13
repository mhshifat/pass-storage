import CreateConnectionBtn from "./create-connection-btn";
import ConnectionsList from "./connections-list";
import { Database } from "lucide-react";

export default function ConnectionsContainer() {
    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2.5">
                            <Database className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
                    </div>
                    <p className="text-muted-foreground text-sm pl-12">
                        Manage your data source connections
                    </p>
                </div>
                <CreateConnectionBtn />
            </div>
            <ConnectionsList />
        </div>
    )
}