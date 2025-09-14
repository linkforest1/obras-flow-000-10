
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreateActivityModal } from "@/components/CreateActivityModal";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  user: any;
  onSignOut: () => void;
}

export function DashboardHeader({
  user,
  onSignOut
}: DashboardHeaderProps) {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setUserProfile(data);
        }
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  return (
    <header className="bg-card border-b border-border p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1 mr-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-2xl font-bold text-foreground truncate">Dashboard</h1>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              <span className="hidden sm:inline">Acompanhamento da programação semanal</span>
              <span className="sm:hidden">Prog. semanal</span>
              {userProfile?.full_name && ` - ${userProfile.full_name}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <div className="md:hidden">
            <ThemeToggle />
          </div>
          
          <div className="hidden sm:block">
            <CreateActivityModal />
          </div>
          <div className="sm:hidden">
            <CreateActivityModal trigger={
              <Button size="sm" className="bg-vale-blue hover:bg-vale-blue/90 p-2">
                <Plus className="w-4 h-4" />
              </Button>
            } />
          </div>
          <Button 
            onClick={onSignOut} 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-2 md:px-3"
          >
            <LogOut className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
