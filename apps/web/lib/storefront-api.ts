// Compatibility facade. New code should import from src/services/storefront-api.
import { storefrontService } from "../src/services/storefront-api";

export { storefrontService };
export const getFeaturedProducts = storefrontService.getFeaturedProducts;
export const getFeaturedProduct = storefrontService.getFeaturedProduct;
export const getOrderByNumber = storefrontService.getOrderByNumber;
export const getVisitorOrders = storefrontService.getVisitorOrders;
export const getAdminAuthMe = storefrontService.getAdminAuthMe;
export const getAdminOrders = storefrontService.getAdminOrders;
export const getAdminProducts = storefrontService.getAdminProducts;
export const getAdminProduct = storefrontService.getAdminProduct;
export const getCategories = storefrontService.getCategories;
