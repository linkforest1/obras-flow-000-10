import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserPacote = () => {
  const [pacote, setPacote] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserPacote = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('pacote')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setPacote(data.pacote || 'Pacote 1');
      }
    } catch (error) {
      console.error('Error fetching user pacote:', error);
      setPacote('Pacote 1'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPacote();
  }, [user]);

  return { pacote, loading, refetch: fetchUserPacote };
};