import DashboardLayout from "@/components/layout/DashboardLayout";
import WorkItemsHeader from "@/components/board/WorkItemsHeader";
import WorkItemsGrid from "@/components/board/WorkItemsGrid";

export default function Home() {
  return (
    <DashboardLayout>
      <WorkItemsHeader />
      <WorkItemsGrid />
    </DashboardLayout>
  );
}
