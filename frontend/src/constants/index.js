export const ROLES = {
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
};

export const ORDER_STATUS = {
    NEW: 'new',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed'
};

export const SHIPPING_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered'
};

export const BRANDS = [
    'All',
    'Nike',
    'Adidas',
    'Jordan',
    'Puma',
    'New Balance',
    'Vans',
    'Converse',
    'Reebok',
    'Asics',
    'Other'
];

export const LEGIT_CHECK_STATUS = {
    PENDING: 'pending',
    VERIFIED: 'verified',
    FAKE: 'fake',
    INCONCLUSIVE: 'inconclusive'
};

export const PRODUCT_APPROVAL = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};
