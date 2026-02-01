import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { createServer } from 'http';
import express from 'express';
import schema from '../graphql/schema';
import { createContext } from '../graphql/context';

export const createApolloServer = async (app: any) => {
  const httpServer = createServer(app);

  const server = new ApolloServer({
    schema,
    // Loosen typing here to avoid conflicts between multiple @types/express versions
    context: ({ req, res }: any) => createContext({ req, res }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql', cors: false });

  return { server, httpServer };
};
