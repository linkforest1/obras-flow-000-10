import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePackageFilter = () => {
  const [userPackage, setUserPackage] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserPackage = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('pacote')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setUserPackage(data.pacote || 'Pacote 1');
        }
      }
    };

    fetchUserPackage();
  }, [user]);

  return { userPackage };
};