export interface Category {
  category_id: number;
  category_name: string;
  parent_id: number | null;
}

export interface Seller {
  user_id: number;
  full_name: string;
  rating_score: number;
}

export interface Product {
  product_id: number;
  product_name: string;
  category_id: number;
  seller_id: number;
  winner_id: number | null;
  start_value: string;
  current_price: string;
  buy_now_value: string;
  price_step: string;
  start_time: string;
  end_time: string;
  status: string;
  permission: boolean;
  auto_renewal: boolean;
  category: Category;
  seller: Seller;
  avatar: string;
  bidCount: number;
  highestBidder: Seller | null;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}
