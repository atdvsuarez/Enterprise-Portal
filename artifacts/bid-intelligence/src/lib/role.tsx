import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Role, User, USERS } from "../data/types";

interface RoleContextType {
  role: Role;
  user: User;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem("bid-intel-role");
    return (saved as Role) || "admin";
  });

  const setRole = (newRole: Role) => {
    localStorage.setItem("bid-intel-role", newRole);
    setRoleState(newRole);
  };

  const user = USERS[role];

  return (
    <RoleContext.Provider value={{ role, user, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
