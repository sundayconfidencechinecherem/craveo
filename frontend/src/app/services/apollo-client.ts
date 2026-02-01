// app/services/apollo-client.ts
import { 
  ApolloClient, 
  InMemoryCache, 
  createHttpLink,
  ApolloLink,
  from
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { gql } from '@apollo/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
const GRAPHQL_ENDPOINT = `${BACKEND_URL}/graphql`;

// ====== ERROR HANDLING LINK ======
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      console.error('[GraphQL Error]:', {
        message: error.message,
        operation: operation.operationName,
        path: error.path
      });
    });
  }
  
  if (networkError) {
    console.error('[Network Error]:', networkError.message);
  }
});

// ====== AUTH LINK TO ADD TOKEN TO HEADERS ======
const authLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') {
    return { headers };
  }
  
  let token: string | null = null;
  const userStr = localStorage.getItem('user');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      token = user.token || localStorage.getItem('token');
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }
  
  return {
    headers: {
      ...headers,
      ...(token ? { 
        Authorization: `Bearer ${token}` 
      } : {}),
    }
  };
});

// ====== HTTP LINK ======
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'include',
});

// ====== COMBINE LINKS ======
const link = from([errorLink, authLink, httpLink]);

// ====== CACHE CONFIGURATION ======
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getSavedPosts: {
          merge(existing = [], incoming: any[]) {
            return incoming;
          },
        },
        getFeed: {
          merge(existing = [], incoming: any[]) {
            return incoming;
          },
        },
      },
    },
  },
});

// ====== CREATE APOLLO CLIENT ======
export const apolloClient = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// ====== HELPER FUNCTIONS ======
export const setAuthData = (user: any, token?: string, refreshToken?: string) => {
  if (typeof window !== 'undefined') {
    const userWithTokens = {
      ...user,
      token: token || user.token,
      refreshToken: refreshToken || user.refreshToken
    };
    
    localStorage.setItem('user', JSON.stringify(userWithTokens));
    if (token) localStorage.setItem('token', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    
    apolloClient.resetStore();
  }
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
  apolloClient.clearStore();
};

export const getCurrentUser = (): any => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user:', error);
        return null;
      }
    }
  }
  return null;
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const user = getCurrentUser();
  return user?.token || localStorage.getItem('token');
};

export default apolloClient;