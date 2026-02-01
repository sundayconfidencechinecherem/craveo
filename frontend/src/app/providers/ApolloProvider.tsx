'use client';
import { ApolloProvider as ApolloClientProvider } from '@apollo/client/react';
import { ReactNode } from 'react';
import { apolloClient } from '../services/apollo-client';

interface ApolloProviderProps {
  children: ReactNode;
}

export default function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <ApolloClientProvider client={apolloClient}>
      {children}
    </ApolloClientProvider>
  );
}
