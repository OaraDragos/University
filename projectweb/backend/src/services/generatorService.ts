import { faker } from "@faker-js/faker";
import { Group, Member, Product } from "../models/types";
import { getGroupsStore } from "../store/memoryStore";
import { createId } from "../utils/id";
import { broadcastGroupEvent } from "../websocket/realtimeHub";

type GeneratorStatus = {
  running: boolean;
  intervalMs: number;
};

let intervalHandle: NodeJS.Timeout | null = null;
let currentIntervalMs = 2000;

const CATEGORY_POOL = ["Meat", "Drinks", "Vegetables", "Bakery", "Snacks", "Sauces", "Dairy"];
const UNIT_POOL = ["buc", "kg", "L", "pachete"];

function pickRandomGroup(groups: Group[]): Group | null {
  if (groups.length === 0) {
    return null;
  }
  const index = Math.floor(Math.random() * groups.length);
  return groups[index];
}

function ensureGeneratorMember(group: Group): Member {
  const existing = group.members.find((member) => member.name === "Auto Generator");
  if (existing) return existing;

  const member: Member = {
    id: createId(),
    name: "Auto Generator",
    gender: "other",
    ageRange: "24-30",
    drinkLevel: 3,
    foodAppetite: 3,
  };
  group.members.push(member);
  return member;
}

function generateProduct(member: Member): Product {
  const quantity = faker.number.int({ min: 1, max: 6 });
  const price = Number(faker.commerce.price({ min: 2, max: 60, dec: 2 }));

  return {
    id: createId(),
    productName: faker.commerce.productName(),
    supermarket: faker.company.name(),
    price,
    quantity,
    unit: faker.helpers.arrayElement(UNIT_POOL),
    category: faker.helpers.arrayElement(CATEGORY_POOL),
    photo: undefined,
    claimedBy: undefined,
    addedBy: member.id,
    addedByName: member.name,
    votes: {
      thumbsUp: [],
      thumbsDown: [],
    },
  };
}

function generatorTick(): void {
  const groups = getGroupsStore();
  const group = pickRandomGroup(groups);
  if (!group) return;

  const generatorMember = ensureGeneratorMember(group);
  const product = generateProduct(generatorMember);
  group.products.unshift(product);

  broadcastGroupEvent(group.id, {
    type: "generator_product_created",
    payload: {
      groupId: group.id,
      product,
    },
  });
}

export function startGenerator(intervalMs = 2000): GeneratorStatus {
  if (intervalHandle) {
    return {
      running: true,
      intervalMs: currentIntervalMs,
    };
  }

  currentIntervalMs = Math.max(500, intervalMs);
  intervalHandle = setInterval(generatorTick, currentIntervalMs);

  return {
    running: true,
    intervalMs: currentIntervalMs,
  };
}

export function stopGenerator(): GeneratorStatus {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }

  return {
    running: false,
    intervalMs: currentIntervalMs,
  };
}

export function getGeneratorStatus(): GeneratorStatus {
  return {
    running: Boolean(intervalHandle),
    intervalMs: currentIntervalMs,
  };
}
