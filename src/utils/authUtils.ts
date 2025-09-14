
/**
 * Utilities for authentication state management and cleanup
 */

export const cleanupAuthState = () => {
  console.log('🧹 Cleaning up auth state...');
  
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log(`Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('✅ Auth state cleanup completed');
};

export const parseResetPasswordUrl = (searchParams: URLSearchParams) => {
  console.log('🔍 Parsing reset password URL parameters');
  
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  console.log('URL Parameters:', {
    accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
    refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
    type,
    error,
    errorDescription
  });
  
  return {
    accessToken,
    refreshToken,
    type,
    error,
    errorDescription
  };
};

export const logAuthState = async (supabase: any) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Current auth session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      sessionExpiry: session?.expires_at,
      error
    });
  } catch (error) {
    console.error('Error getting auth session:', error);
  }
};
