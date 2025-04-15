
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, User } from "lucide-react";

export function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getIconClassName = (active: boolean) => {
    return active ? "text-primary" : "text-muted-foreground";
  };

  const getLabelClassName = (active: boolean) => {
    return active ? "text-primary" : "text-muted-foreground";
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-t-border bg-background py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around">
          <Link to="/" className="flex flex-col items-center p-2">
            <Home className={`h-6 w-6 ${getIconClassName(isActive("/"))}`} />
            <span className={`text-xs mt-1 ${getLabelClassName(isActive("/"))}`}>Dashboard</span>
          </Link>
          
          <Link to="/reports" className="flex flex-col items-center p-2">
            <FileText className={`h-6 w-6 ${getIconClassName(isActive("/reports"))}`} />
            <span className={`text-xs mt-1 ${getLabelClassName(isActive("/reports"))}`}>Reports</span>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center p-2">
            <User className={`h-6 w-6 ${getIconClassName(isActive("/profile"))}`} />
            <span className={`text-xs mt-1 ${getLabelClassName(isActive("/profile"))}`}>Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
