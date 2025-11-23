import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Dashboard layout
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tea-Kiting</h1>
            <nav className="ml-10 space-x-4">
              <Link to="/" className="text-gray-500 hover:text-gray-900">
                Dashboard
              </Link>
              {user?.role === "user" && (
                <Link
                  to="/create-ticket"
                  className="text-gray-500 hover:text-gray-900"
                >
                  Create Ticket
                </Link>
              )}
            </nav>
          </div>
          {/* Show user name and role and handle logout on clicking. */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user?.name} ({user?.role})
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      {/* All tickets will be shown below and grow as per no. of tickets increases. */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
