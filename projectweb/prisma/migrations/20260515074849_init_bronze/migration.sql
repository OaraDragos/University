-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "joinPassword" TEXT,
    "locationLat" REAL NOT NULL,
    "locationLng" REAL NOT NULL,
    "locationAddr" TEXT NOT NULL,
    "cabinDetails" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "drinkLevel" INTEGER NOT NULL,
    "foodAppetite" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "supermarket" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantity" INTEGER,
    "unit" TEXT,
    "category" TEXT NOT NULL,
    "photo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedById" TEXT NOT NULL,
    "claimedById" TEXT,
    CONSTRAINT "Product_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "upVoterId" TEXT,
    "downVoterId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductVote_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductVote_upVoterId_fkey" FOREIGN KEY ("upVoterId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductVote_downVoterId_fkey" FOREIGN KEY ("downVoterId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_shareCode_key" ON "Group"("shareCode");

-- CreateIndex
CREATE INDEX "Group_createdAt_idx" ON "Group"("createdAt");

-- CreateIndex
CREATE INDEX "Group_locationAddr_idx" ON "Group"("locationAddr");

-- CreateIndex
CREATE INDEX "Member_groupId_createdAt_idx" ON "Member"("groupId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Member_groupId_name_key" ON "Member"("groupId", "name");

-- CreateIndex
CREATE INDEX "Product_groupId_category_createdAt_idx" ON "Product"("groupId", "category", "createdAt");

-- CreateIndex
CREATE INDEX "Product_addedById_idx" ON "Product"("addedById");

-- CreateIndex
CREATE INDEX "Product_claimedById_idx" ON "Product"("claimedById");

-- CreateIndex
CREATE INDEX "ProductVote_productId_createdAt_idx" ON "ProductVote"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVote_productId_upVoterId_key" ON "ProductVote"("productId", "upVoterId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVote_productId_downVoterId_key" ON "ProductVote"("productId", "downVoterId");
