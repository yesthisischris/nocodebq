import { queries, type Query, type InsertQuery, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Query operations
  createQuery(query: InsertQuery): Promise<Query>;
  getQuery(id: number): Promise<Query | undefined>;
  getQueries(): Promise<Query[]>;
  updateQuery(id: number, query: Partial<InsertQuery>): Promise<Query | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private queryStore: Map<number, Query>;
  private userCurrentId: number;
  private queryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.queryStore = new Map();
    this.userCurrentId = 1;
    this.queryCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createQuery(insertQuery: InsertQuery): Promise<Query> {
    const id = this.queryCurrentId++;
    
    // Ensure all required fields are non-undefined
    const processedQuery = {
      ...insertQuery,
      processingGb: insertQuery.processingGb ?? null,
      summary: insertQuery.summary ?? null,
      results: insertQuery.results ?? null
    };
    
    const query: Query = { 
      ...processedQuery, 
      id, 
      createdAt: new Date() 
    };
    
    this.queryStore.set(id, query);
    return query;
  }

  async getQuery(id: number): Promise<Query | undefined> {
    return this.queryStore.get(id);
  }

  async getQueries(): Promise<Query[]> {
    return Array.from(this.queryStore.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateQuery(id: number, partialQuery: Partial<InsertQuery>): Promise<Query | undefined> {
    const existingQuery = this.queryStore.get(id);
    if (!existingQuery) return undefined;

    // Ensure field types match expected types
    const processedPartial = {
      ...partialQuery,
      processingGb: partialQuery.processingGb ?? existingQuery.processingGb,
      summary: partialQuery.summary ?? existingQuery.summary,
      results: partialQuery.results ?? existingQuery.results
    };

    const updatedQuery = { ...existingQuery, ...processedPartial };
    this.queryStore.set(id, updatedQuery);
    return updatedQuery;
  }
}

export const storage = new MemStorage();
