
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { supabase } from '@/integrations/supabase/client';

const httpLink = createHttpLink({
  uri: 'https://ihxvtltuqsnasxdkmbhz.supabase.co/graphql/v1',
});

const authLink = setContext(async (_, { headers }) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  return {
    headers: {
      ...headers,
      authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
      apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloeHZ0bHR1cXNuYXN4ZGttYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTUwNjksImV4cCI6MjA2NTA5MTA2OX0.Cs9JlS9IAMv5CkFN90Emaqd9NxG_tvNRK2c8FHJ2IVM",
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
