import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import permissionReducer from './permissionSlice';
import { combineReducers } from 'redux';

// Kết hợp các reducers
const rootReducer = combineReducers({
  auth: authReducer,
  permission: permissionReducer,
});

// Cấu hình redux-persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth','permission'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store với configureStore
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Tắt kiểm tra tuần tự hóa
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Tạo persistor
const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
