import CreateConnectionBtn from "./create-connection-btn";
import ConnectionsList from "./connections-list";

export default function ConnectionsContainer() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Connect and manage your data sources for analysis
                        </p>
                    </div>
                    <CreateConnectionBtn />
                </div>
                <ConnectionsList />
            </div>
        </div>
    )
}