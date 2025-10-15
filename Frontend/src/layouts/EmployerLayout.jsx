import NavBar from "../components/NavBar";
import EmployerSidebar from "../components/EmployerSidebar";

function EmployerLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <EmployerSidebar />
      <div className="flex flex-col flex-1">
        <NavBar userRole="employer" />
        <main className="p-6 bg-gray-100 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default EmployerLayout;
