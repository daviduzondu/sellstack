export const UNAUTHORIZED = 'UNAUTHORIZED';
export const USER_NOT_FOUND = 'Failed to retrieve user';
export const STORE_ALREADY_EXISTS = 'A store already exists for this user';
export const STORE_NOT_FOUND = 'Store not found';
export const PRODUCT_OR_VARIANT_NOT_FOUND = 'Product or variant not found';
export const INVALID_UPLOAD_TOKEN = 'Invalid upload token';
export const FAILED_TO_UPLOAD = 'Failed to upload file';
export const INTERNAL_SERVER_ERROR = 'Internal server error';
export const PRODUCT_ALREADY_EXISTS_IN_CART = 'Product already exists in cart';
export const CART_NOT_FOUND = 'Cart not found';
export const CART_ITEM_NOT_FOUND = 'Cart item not found';
export const FAILED_TO_CREATE_CART = 'Failed to create cart';
export const ORDER_NOT_FOUND = 'Order not found';
export const ORDER_NOT_CANCELLABLE =
  'Order cannot be cancelled in its current state';
export const ORDER_NOT_PENDING = 'Order is not in PENDING status';
export const INVALID_ORDER_STATUS_TRANSITION =
  'Invalid order status transition';
export const ORDER_CHECKOUT_FAILED = 'Failed to checkout cart';
export const EMPTY_CART = "Cannot checkout because there's nothing in cart";
export const PAYSTACK_GATEWAY_ERROR =
  'An error occured while contacting the payment provider.';
export const FAILED_TO_VERIFY_TRANSACTION =
  'Failed to verify transaction status. Please try again later.';
export const ALREADY_MADE_PAYMENT = "You've already paid";
export const FAILED_TO_RESOLVE_ACCOUNT = 'Failed to resolve account number. Try again later';
export const SETTLEMENT_ACCOUNT_ALREADY_EXISTS = "Settlement account already exists";
export const FAILED_TO_RETRIEVE_SETTLEMENT_ACCOUNT = "You cannot proceed with checkout because this seller is missing some details";