
import { useNavigate, useLocation } from "react-router-dom";
import { menuItems } from "./AppSidebar";
import { cn } from "@/lib/utils";

export function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="overflow-x-auto whitespace-nowrap">
        <nav className="flex flex-row items-center">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => handleNavigation(item.url)}
              className={cn(
                "flex flex-col items-center justify-center flex-shrink-0 py-2 px-3 text-center w-[80px] h-[60px]",
                "transition-colors",
                location.pathname === item.url
                  ? "text-vale-blue bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs leading-tight font-medium">{item.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
