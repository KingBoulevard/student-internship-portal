import Navbar from "../components/NavBar";
import StudentSidebar from "../components/StudentSidebar";

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <StudentSidebar />
      <div className="flex flex-col flex-1">
        <Navbar userRole="student" />
        <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
