export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	parent_id?: string;
	image_url?: string;
	sort_order: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	children?: Category[];
}

export interface Product {
	id: string;
	sku: string;
	name: string;
	slug: string;
	brand?: string;
	description?: string;
	short_description?: string;
	price: number;
	compare_at_price?: number;
	sale_price?: number;
	cost_price?: number;
	currency: string;
	images: string[] | any; // Allow both string array and JSONB
	category_id?: string;
	store_id?: string;
	stock_quantity: number;
	stock?: number; // Alternative field name in existing table
	track_inventory: boolean;
	allow_backorders: boolean;
	weight?: number;
	weight_grams?: number;
	dimensions?: {
		length?: number;
		width?: number;
		height?: number;
		unit?: string;
	};
	dimensions_cm?: any; // JSONB field in existing table
	tags?: string[];
	attributes?: any; // JSONB field containing tags and meta data
	meta_title?: string;
	meta_description?: string;
	is_active: boolean;
	status?: string; // Alternative field name in existing table
	is_featured: boolean;
	requires_shipping: boolean;
	created_at: string;
	updated_at: string;
	categories?: Category;
}

export interface ProductsResponse {
	products: Product[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
	filters: {
		search: string;
		category: string;
		minPrice?: string;
		maxPrice?: string;
		sortBy: string;
		sortOrder: string;
		featured?: string;
	};
}

export interface CategoriesResponse {
	categories: Category[];
	flat: Category[];
}

// Cart-related interfaces
export interface CartItem {
	id: string;
	user_id: string;
	product_sku: string;
	quantity: number;
	created_at: string;
	updated_at: string;
	product?: Product;
	currentPrice?: number;
	itemTotal?: number;
	isAvailable?: boolean;
}

export interface CartSummary {
	subtotal: number;
	itemCount: number;
	currency: string;
}

export interface CartResponse {
	items: CartItem[];
	summary: CartSummary;
}

// Order-related interfaces (for upcoming checkout system)
export interface Order {
	id: string;
	user_id: string;
	order_number: string;
	status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
	currency: string;
	subtotal_amount: number;
	tax_amount: number;
	shipping_amount: number;
	total_amount: number;
	
	// Payment information
	payment_method?: string;
	payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
	stripe_payment_intent_id?: string;
	
	// Shipping information
	shipping_name?: string;
	shipping_email?: string;
	shipping_phone?: string;
	shipping_address_line1?: string;
	shipping_address_line2?: string;
	shipping_city?: string;
	shipping_state?: string;
	shipping_postal_code?: string;
	shipping_country?: string;
	
	// Billing information
	billing_name?: string;
	billing_email?: string;
	billing_address_line1?: string;
	billing_address_line2?: string;
	billing_city?: string;
	billing_state?: string;
	billing_postal_code?: string;
	billing_country?: string;
	
	// Timestamps
	created_at: string;
	updated_at: string;
	shipped_at?: string;
	delivered_at?: string;
	
	// Related data
	items?: OrderItem[];
}

export interface OrderItem {
	id: string;
	order_id: string;
	product_sku: string;
	product_name: string;
	product_slug?: string;
	quantity: number;
	unit_price: number;
	total_price: number;
	
	// Product snapshot at time of order
	product_image_url?: string;
	product_attributes?: any;
	
	created_at: string;
}

// Address interfaces
export interface Address {
	name: string;
	email?: string;
	phone?: string;
	line1: string;
	line2?: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
}

// Checkout interfaces
export interface CheckoutData {
	payment_method_id: string;
	shipping_address: Address;
	billing_address?: Address;
	same_as_shipping: boolean;
}

export interface CheckoutResponse {
	success?: boolean;
	requires_action?: boolean;
	payment_intent?: {
		id: string;
		client_secret: string;
	};
	order?: {
		id: string;
		order_number: string;
		total_amount: number;
		currency: string;
	};
	payment_intent_id?: string;
	error?: string;
	details?: string;
	payment_intent_status?: string;
	product_sku?: string;
	available?: number;
}

// User interface
export interface User {
	id: string;
	email: string;
	name?: string;
	avatar_url?: string;
	created_at: string;
	updated_at: string;
} 