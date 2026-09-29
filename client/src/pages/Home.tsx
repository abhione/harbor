import { useHarbor } from "@/context/PersonaContext";
import FinanceHome from "./FinanceHome";
import ManagerHome from "./ManagerHome";
import PeopleOpsHome from "./PeopleOpsHome";
import SupplierHome from "./SupplierHome";
import WorkerHome from "./WorkerHome";

export default function Home() {
  const { persona } = useHarbor();
  if (persona === "manager") return <ManagerHome />;
  if (persona === "finance") return <FinanceHome />;
  if (persona === "supplier") return <SupplierHome />;
  if (persona === "worker") return <WorkerHome />;
  return <PeopleOpsHome />;
}
