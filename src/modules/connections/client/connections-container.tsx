import CreateConnectionBtn from "./create-connection-btn";
import ConnectionsList from "./connections-list";

export default function ConnectionsContainer() {
    return (
        <div className="flex flex-col gap-5">
            <CreateConnectionBtn />
            <ConnectionsList />
        </div>
    )
}