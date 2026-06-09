import { buildSchema, graphql } from "graphql";
import {
  addMember,
  addProduct,
  createGroup,
  deleteGroup,
  deleteMember,
  deleteProduct,
  getGroupById,
  getGroupsStatistics,
  getProductsStatistics,
  listGroups,
  listMembers,
  listProducts,
  updateGroup,
  updateMember,
  updateProduct,
} from "../services/groupsService";
import { createGroupSchema, updateGroupSchema } from "../validators/groupValidators";
import { memberSchema, memberUpdateSchema } from "../validators/memberValidators";
import { createProductSchema, updateProductSchema } from "../validators/productValidators";

const schema = buildSchema(`
  type Votes {
    thumbsUp: [String!]!
    thumbsDown: [String!]!
  }

  type Product {
    id: String!
    productName: String!
    supermarket: String!
    price: Float!
    quantity: Int
    unit: String
    category: String!
    photo: String
    claimedBy: String
    addedBy: String!
    addedByName: String!
    votes: Votes
  }

  type Member {
    id: String!
    name: String!
    gender: String!
    ageRange: String!
    drinkLevel: Int!
    foodAppetite: Int!
  }

  type Location {
    lat: Float!
    lng: Float!
    address: String!
  }

  type Group {
    id: String!
    name: String!
    shareCode: String!
    joinPassword: String
    location: Location!
    cabinDetails: String!
    createdAt: String!
    members: [Member!]!
    products: [Product!]!
  }

  type PaginatedGroups {
    data: [Group!]!
    page: Int!
    limit: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type PaginatedMembers {
    data: [Member!]!
    page: Int!
    limit: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type PaginatedProducts {
    data: [Product!]!
    page: Int!
    limit: Int!
    totalItems: Int!
    totalPages: Int!
  }

  type GlobalStatistics {
    totalGroups: Int!
    totalMembers: Int!
    totalProducts: Int!
    averageMembersPerGroup: Float!
    averageProductsPerGroup: Float!
    groupsByAddress: String!
  }

  input GroupLocationInput {
    lat: Float!
    lng: Float!
    address: String!
  }

  input GroupInput {
    name: String!
    joinPassword: String!
    location: GroupLocationInput!
    cabinDetails: String!
  }

  input UpdateGroupInput {
    name: String
    joinPassword: String
    location: GroupLocationInput
    cabinDetails: String
  }

  input MemberInput {
    name: String!
    gender: String!
    ageRange: String!
    drinkLevel: Int!
    foodAppetite: Int!
  }

  input UpdateMemberInput {
    name: String
    gender: String
    ageRange: String
    drinkLevel: Int
    foodAppetite: Int
  }

  input VotesInput {
    thumbsUp: [String!]
    thumbsDown: [String!]
  }

  input ProductInput {
    productName: String!
    supermarket: String!
    price: Float!
    quantity: Int
    unit: String
    category: String!
    photo: String
    addedBy: String!
    addedByName: String!
    claimedBy: String
    votes: VotesInput
  }

  input UpdateProductInput {
    productName: String
    supermarket: String
    price: Float
    quantity: Int
    unit: String
    category: String
    photo: String
    claimedBy: String
    votes: VotesInput
  }

  type Query {
    groups(page: Int, limit: Int): PaginatedGroups!
    group(id: String!): Group!
    members(groupId: String!, page: Int, limit: Int): PaginatedMembers!
    products(groupId: String!, page: Int, limit: Int): PaginatedProducts!
    groupsStatistics: GlobalStatistics!
    productsStatistics(groupId: String!): String!
  }

  type Mutation {
    createGroup(input: GroupInput!): Group!
    updateGroup(id: String!, input: UpdateGroupInput!): Group!
    deleteGroup(id: String!): Group!

    addMember(groupId: String!, input: MemberInput!): Member!
    updateMember(groupId: String!, memberId: String!, input: UpdateMemberInput!): Member!
    deleteMember(groupId: String!, memberId: String!): Member!

    addProduct(groupId: String!, input: ProductInput!): Product!
    updateProduct(groupId: String!, productId: String!, input: UpdateProductInput!): Product!
    deleteProduct(groupId: String!, productId: String!): Product!
  }
`);

const root = {
  groups: ({ page = 1, limit = 5 }: { page?: number; limit?: number }) => listGroups(page, limit),
  group: ({ id }: { id: string }) => getGroupById(id),
  members: ({ groupId, page = 1, limit = 10 }: { groupId: string; page?: number; limit?: number }) =>
    listMembers(groupId, page, limit),
  products: ({ groupId, page = 1, limit = 10 }: { groupId: string; page?: number; limit?: number }) =>
    listProducts(groupId, page, limit),
  groupsStatistics: () => {
    const stats = getGroupsStatistics();
    return {
      ...stats,
      groupsByAddress: JSON.stringify(stats.groupsByAddress),
    };
  },
  productsStatistics: ({ groupId }: { groupId: string }) => JSON.stringify(getProductsStatistics(groupId)),

  createGroup: ({ input }: { input: unknown }) => createGroup(createGroupSchema.parse(input)),
  updateGroup: ({ id, input }: { id: string; input: unknown }) => updateGroup(id, updateGroupSchema.parse(input)),
  deleteGroup: ({ id }: { id: string }) => deleteGroup(id),

  addMember: ({ groupId, input }: { groupId: string; input: unknown }) => addMember(groupId, memberSchema.parse(input)),
  updateMember: ({ groupId, memberId, input }: { groupId: string; memberId: string; input: unknown }) =>
    updateMember(groupId, memberId, memberUpdateSchema.parse(input)),
  deleteMember: ({ groupId, memberId }: { groupId: string; memberId: string }) => deleteMember(groupId, memberId),

  addProduct: ({ groupId, input }: { groupId: string; input: unknown }) =>
    addProduct(groupId, createProductSchema.parse(input)),
  updateProduct: ({ groupId, productId, input }: { groupId: string; productId: string; input: unknown }) =>
    updateProduct(groupId, productId, updateProductSchema.parse(input)),
  deleteProduct: ({ groupId, productId }: { groupId: string; productId: string }) => deleteProduct(groupId, productId),
};

export async function executeGraphQL(query: string, variables?: Record<string, unknown>) {
  return graphql({
    schema,
    source: query,
    rootValue: root,
    variableValues: variables,
  });
}
