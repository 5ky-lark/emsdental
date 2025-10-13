import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { CartItem, SelectedInclusion } from '@/types/product';
import { useSession } from 'next-auth/react';

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  total: 0,
};

const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}>({
  state: initialState,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

// Helper function to calculate total price of an item including inclusions
const calculateItemTotal = (item: CartItem): number => {
  let itemPrice = item.price;
  
  // Add prices from selected inclusions
  if (item.selectedInclusions && item.selectedInclusions.length > 0) {
    itemPrice += item.selectedInclusions.reduce((sum, inclusion) => sum + inclusion.price, 0);
  }
  
  // Alternative for includedItems (this structure may be used once stored in the cart)
  if (item.includedItems && item.includedItems.length > 0) {
    itemPrice += item.includedItems.reduce((sum, inclusion) => sum + inclusion.price, 0);
  }
  
  return itemPrice * item.quantity;
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { 
                ...item, 
                quantity: item.quantity + action.payload.quantity,
                // Preserve existing inclusions
                selectedInclusions: action.payload.selectedInclusions || item.selectedInclusions,
                includedItems: action.payload.includedItems || item.includedItems
              }
            : item
        );
        
        // Recalculate total
        const total = updatedItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        
        return {
          ...state,
          items: updatedItems,
          total
        };
      }

      // Calculate new total with the new item
      const total = state.items.reduce((sum, item) => sum + calculateItemTotal(item), 0) + 
                   calculateItemTotal(action.payload);

      return {
        ...state,
        items: [...state.items, action.payload],
        total
      };
    }

    case 'REMOVE_ITEM': {
      const itemsAfterRemoval = state.items.filter(item => item.id !== action.payload);
      
      // Recalculate total
      const total = itemsAfterRemoval.reduce((sum, item) => sum + calculateItemTotal(item), 0);

      return {
        ...state,
        items: itemsAfterRemoval,
        total
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      // Recalculate total
      const total = updatedItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
      
      return {
        ...state,
        items: updatedItems,
        total
      };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id || session?.user?.email || 'guest';
  const cartKey = `cart_${userId}`;
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const prevUserId = useRef(userId);

  // Save cart to the previous user's key before userId changes (logout/login)
  useEffect(() => {
    if (prevUserId.current !== userId) {
      // Save current cart to previous user's key
      const prevKey = `cart_${prevUserId.current}`;
      localStorage.setItem(prevKey, JSON.stringify(state));
      prevUserId.current = userId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Load cart from localStorage on mount or when user changes
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart && Array.isArray(parsedCart.items) && typeof parsedCart.total === 'number') {
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        }
      } else {
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem(cartKey);
      dispatch({ type: 'CLEAR_CART' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, userId]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem(cartKey);
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 