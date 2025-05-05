import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProduct } from '../../types/Product';

interface WishlistState {
  items: IProduct[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist(state, action: PayloadAction<IProduct>) {
      const product = action.payload;
      // Check if the product is already in the wishlist
      const exists = state.items.find(item => item._id === product._id);
      if (!exists) {
        state.items.push(product); // Add product to wishlist if not already present
      }
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      // Remove product from wishlist by id
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    setWishlist(state, action: PayloadAction<IProduct[]>) {
      state.items = action.payload; // Set the wishlist items
    },
  },
});

export const { addToWishlist, removeFromWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer; 