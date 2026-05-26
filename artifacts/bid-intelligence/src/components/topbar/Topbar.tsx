import { useRole } from "@/lib/role";
import { Role } from "@/data/types";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { role, setRole } = useRole();

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search RFQs, customers, parts..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-card"></span>
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">View as:</span>
          <Select value={role} onValueChange={(val) => setRole(val as Role)}>
            <SelectTrigger className="w-[180px] h-9 bg-muted/30">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin (Daily Bids)</SelectItem>
              <SelectItem value="scout">Scout</SelectItem>
              <SelectItem value="ae">Account Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
