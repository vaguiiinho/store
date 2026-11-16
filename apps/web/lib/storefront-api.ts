// Compatibility facade. New code should import from src/services/storefront-api.
import { storefrontService } from "../src/services/storefront-api";

export { storefrontService };
export const getFeaturedProducts = storefrontService.getFeaturedProducts;
export const getFeaturedProduct = storefrontService.getFeaturedProduct;
export const getOrderByNumber = storefrontService.getOrderByNumber;
export const getMyOrders = storefrontService.getMyOrders;
export const getAuthMe = storefrontService.getAuthMe;
export const getAdminUsers = storefrontService.getAdminUsers;
export const getAdminUser = storefrontService.getAdminUser;
export const getAdminUserOrders = storefrontService.getAdminUserOrders;
export const getAdminOrders = storefrontService.getAdminOrders;
export const getAdminProducts = storefrontService.getAdminProducts;
export const getAdminProduct = storefrontService.getAdminProduct;
export const getCategories = storefrontService.getCategories;
