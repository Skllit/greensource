import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { selectAuth } from "./authSlice";
import { RootState } from "../index";

// mirror your Mongo documents
export interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  // ...other props if you care
}

interface AdminState {
  orders: number;
  customers: number;
  farmers: number;
  deliveryAgents: number;
  ordersList: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  orders: 0,
  customers: 0,
  farmers: 0,
  deliveryAgents: 0,
  ordersList: [],
  loading: false,
  error: null,
};

export const fetchStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const { token } = selectAuth(state);

    const [ordRes, custRes, farmRes, delRes] = await Promise.all([
      axios.get<Order[]>("http://localhost:3800/api/orders/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get<{ data: any[] }>("http://localhost:3800/api/customers/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:3800/api/farmers/api/farmers", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:3800/api/delivery/agents", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    return {
      orders: ordRes.data.length,
      customers: custRes.data.data.length,
      farmers: farmRes.data.length,
      deliveryAgents: delRes.data.length,
    };
  }
);

export const fetchOrdersList = createAsyncThunk(
  "admin/fetchOrdersList",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const { token } = selectAuth(state);

    const res = await axios.get<Order[]>(
      "http://localhost:3800/api/orders/api/orders",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data; // this is Order[]
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b
      // stats
      .addCase(fetchStats.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchStats.fulfilled, (s, a) => {
        s.loading = false;
        s.orders = a.payload.orders;
        s.customers = a.payload.customers;
        s.farmers = a.payload.farmers;
        s.deliveryAgents = a.payload.deliveryAgents;
      })
      .addCase(fetchStats.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? "Failed to fetch stats";
      })

      // ordersList
      .addCase(fetchOrdersList.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchOrdersList.fulfilled, (s, a) => {
        s.loading = false;
        s.ordersList = a.payload;
      })
      .addCase(fetchOrdersList.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? "Failed to fetch orders";
      });
  },
});

export default adminSlice.reducer;
