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

export type Orderstatus = Static<typeof Orderstatus>
export const Orderstatus = Type.Union([
Type.Literal("FAILED"),
Type.Literal("PAID"),
Type.Literal("PENDING"),
Type.Literal("REFUNDED")
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

export type CartItems = Static<typeof CartItems>
export const CartItems = Type.Object({
cartId: Type.String(),
createdAt: Type.Date(),
currency: Currency,
id: Type.String(),
quantity: Type.Number(),
unitPrice: Type.String(),
updatedAt: Type.Date(),
variantId: Type.String()
})

export type Carts = Static<typeof Carts>
export const Carts = Type.Object({
checkedOutAt: Type.Union([
Type.Date(),
Type.Null()
]),
createdAt: Type.Date(),
id: Type.String(),
storeId: Type.String(),
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

export type OrderItems = Static<typeof OrderItems>
export const OrderItems = Type.Object({
createdAt: Type.Date(),
currency: Currency,
id: Type.String(),
longDescription: Type.String(),
name: Type.Union([
Type.String(),
Type.Null()
]),
orderId: Type.String(),
platformFee: Type.String(),
quantity: Type.Number(),
s3_key: Type.Union([
Type.String(),
Type.Null()
]),
shortDescription: Type.String(),
total: Type.String(),
type: Producttype,
unitPrice: Type.String(),
updatedAt: Type.Date(),
variantId: Type.Union([
Type.String(),
Type.Null()
])
})

export type Orders = Static<typeof Orders>
export const Orders = Type.Object({
buyerId: Type.String(),
cartId: Type.Union([
Type.String(),
Type.Null()
]),
createdAt: Type.Date(),
id: Type.String(),
paidAt: Type.Union([
Type.Date(),
Type.Null()
]),
reference: Type.String(),
status: Orderstatus,
updatedAt: Type.Date()
})

export type ProductFiles = Static<typeof ProductFiles>
export const ProductFiles = Type.Object({
createdAt: Type.Date(),
fileName: Type.String(),
fileSizeBytes: Type.Number(),
id: Type.String(),
mimeType: Type.String(),
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
cart_items: CartItems,
carts: Carts,
ebooks: Ebooks,
order_items: OrderItems,
orders: Orders,
product_files: ProductFiles,
product_variants: ProductVariants,
products: Products,
sessions: Sessions,
stores: Stores,
users: Users,
verifications: Verifications
})