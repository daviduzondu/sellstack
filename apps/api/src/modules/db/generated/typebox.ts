import { Type, Static } from '@sinclair/typebox'


export type Bookformat = Static<typeof Bookformat>
export const Bookformat = Type.Union([
Type.Literal("DOCX"),
Type.Literal("EPUB"),
Type.Literal("PDF")
])

export type Currency = Static<typeof Currency>
export const Currency = Type.Union([
Type.Literal("NGN"),
Type.Literal("USD")
])

export type Pricingtype = Static<typeof Pricingtype>
export const Pricingtype = Type.Union([
Type.Literal("FIXED"),
Type.Literal("FLEXIBLE")
])

export type Productstatus = Static<typeof Productstatus>
export const Productstatus = Type.Union([
Type.Literal("DRAFT"),
Type.Literal("PUBLISHED"),
Type.Literal("SUSPENDED")
])

export type Producttype = Static<typeof Producttype>
export const Producttype = Type.Union([
Type.Literal("AUDIO"),
Type.Literal("EBOOK"),
Type.Literal("MEMBERSHIP"),
Type.Literal("OTHER")
])

export type Accounts = Static<typeof Accounts>
export const Accounts = Type.Object({
accessToken: Type.Union([
Type.String(),
Type.Null()
]),
accessTokenExpiresAt: Type.Union([
Type.Date(),
Type.Null()
]),
accountId: Type.String(),
createdAt: Type.Date(),
id: Type.String(),
idToken: Type.Union([
Type.String(),
Type.Null()
]),
password: Type.Union([
Type.String(),
Type.Null()
]),
providerId: Type.String(),
refreshToken: Type.Union([
Type.String(),
Type.Null()
]),
refreshTokenExpiresAt: Type.Union([
Type.Date(),
Type.Null()
]),
scope: Type.Union([
Type.String(),
Type.Null()
]),
updatedAt: Type.Date(),
userId: Type.String()
})

export type Ebooks = Static<typeof Ebooks>
export const Ebooks = Type.Object({
createdAt: Type.Date(),
edition: Type.Union([
Type.String(),
Type.Null()
]),
format: Type.Union([
Bookformat,
Type.Null()
]),
id: Type.String(),
language: Type.Union([
Type.String(),
Type.Null()
]),
pageCount: Type.Union([
Type.Number(),
Type.Null()
]),
publishedAt: Type.Union([
Type.Date(),
Type.Null()
]),
updatedAt: Type.Date(),
variantId: Type.String()
})

export type ProductFiles = Static<typeof ProductFiles>
export const ProductFiles = Type.Object({
createdAt: Type.Date(),
fileName: Type.String(),
fileSizeBytes: Type.Number(),
id: Type.String(),
productId: Type.String(),
s3_key: Type.String(),
updatedAt: Type.Date(),
variantId: Type.String()
})

export type Products = Static<typeof Products>
export const Products = Type.Object({
createdAt: Type.Date(),
currency: Currency,
deletedAt: Type.Union([
Type.Date(),
Type.Null()
]),
id: Type.String(),
longDescription: Type.Union([
Type.String(),
Type.Null()
]),
name: Type.String(),
shortDescription: Type.Union([
Type.String(),
Type.Null()
]),
status: Productstatus,
storeId: Type.String(),
type: Producttype,
updatedAt: Type.Date(),
userId: Type.String()
})

export type ProductVariants = Static<typeof ProductVariants>
export const ProductVariants = Type.Object({
createdAt: Type.Date(),
id: Type.String(),
isDefault: Type.Boolean(),
minPrice: Type.Union([
Type.String(),
Type.Null()
]),
name: Type.String(),
price: Type.String(),
pricingType: Pricingtype,
productId: Type.String(),
shortDescription: Type.String(),
updatedAt: Type.Date()
})

export type Sessions = Static<typeof Sessions>
export const Sessions = Type.Object({
createdAt: Type.Date(),
expiresAt: Type.Date(),
id: Type.String(),
ipAddress: Type.Union([
Type.String(),
Type.Null()
]),
token: Type.String(),
updatedAt: Type.Date(),
userAgent: Type.Union([
Type.String(),
Type.Null()
]),
userId: Type.String()
})

export type Stores = Static<typeof Stores>
export const Stores = Type.Object({
createdAt: Type.Date(),
deletedAt: Type.Union([
Type.Date(),
Type.Null()
]),
description: Type.Union([
Type.String(),
Type.Null()
]),
id: Type.String(),
name: Type.String(),
slug: Type.String(),
updatedAt: Type.Date(),
userId: Type.String()
})

export type Users = Static<typeof Users>
export const Users = Type.Object({
createdAt: Type.Date(),
email: Type.String(),
emailVerified: Type.Boolean(),
id: Type.String(),
image: Type.Union([
Type.String(),
Type.Null()
]),
name: Type.String(),
updatedAt: Type.Date()
})

export type Verifications = Static<typeof Verifications>
export const Verifications = Type.Object({
createdAt: Type.Date(),
expiresAt: Type.Date(),
id: Type.String(),
identifier: Type.String(),
updatedAt: Type.Date(),
value: Type.String()
})

export type DB = Static<typeof DB>
export const DB = Type.Object({
accounts: Accounts,
ebooks: Ebooks,
product_files: ProductFiles,
product_variants: ProductVariants,
products: Products,
sessions: Sessions,
stores: Stores,
users: Users,
verifications: Verifications
})