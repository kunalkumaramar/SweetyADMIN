import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productReducer from "./productSlice";
import categoryReducer from "./categorySlice";
import subcategoryReducer from "./subcategorySlice";
import discountReducer from "./discountSlice";
import orderReducer from "./orderSlice";
const store= configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        category: categoryReducer,
        subcategory: subcategoryReducer,
        discount: discountReducer,
        order: orderReducer
    },
});

export default store;
