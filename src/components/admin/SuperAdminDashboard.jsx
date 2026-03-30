import AdminDashboardBase from "./AdminDashboardBase";

export default function SuperAdminDashboard(props) {
  return <AdminDashboardBase {...props} role="super-admin" />;
}
