import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productReducer from "./productSlice";
import categoryReducer from "./categorySlice";
import subCategoryReducer from "./subcategorySlice";
import discountReducer from "./discountSlice";
import orderReducer from "./orderSlice";
import blogsReducer from "./blogsSlice";
import bannerReducer from "./bannerSlice";
import mobileBannerSlice from "./mobileBannerSlice";
const store= configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        category: categoryReducer,
        subCategory: subCategoryReducer,
        discount: discountReducer,
        order: orderReducer,
        blogs: blogsReducer,
        banner: bannerReducer,
        mobileBanner: mobileBannerSlice,
    },
});

export default store;
