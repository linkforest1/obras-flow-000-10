
import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/graphql';

interface GraphQLProviderProps {
  children: React.ReactNode;
}

export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({ children }) => {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
};
