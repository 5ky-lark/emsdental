// Simple analytics tracking (without Google Analytics)
// You can replace this with your preferred analytics solution

// Simple event tracking
const analytics = {
  events: [] as any[],
  
  // Track events locally (can be sent to your own analytics endpoint)
  track: (event: string, data: any = {}) => {
    const eventData = {
      event,
      data,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    };
    
    analytics.events.push(eventData);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventData);
    }
    
    // You can send this data to your own analytics endpoint
    // sendToAnalyticsEndpoint(eventData);
  }
};

// Initialize analytics (placeholder)
export const initGA = () => {
  // No Google Analytics initialization needed
  console.log('Analytics initialized (no external tracking)');
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  analytics.track('page_view', {
    url,
    title: title || document.title,
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  analytics.track('custom_event', {
    action,
    category,
    label,
    value,
  });
};

// E-commerce tracking
export const trackPurchase = (transactionId: string, value: number, currency: string, items: any[]) => {
  analytics.track('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
};

export const trackAddToCart = (itemId: string, itemName: string, category: string, price: number, quantity: number) => {
  analytics.track('add_to_cart', {
    item_id: itemId,
    item_name: itemName,
    item_category: category,
    price,
    quantity,
    currency: 'PHP',
    value: price * quantity,
  });
};

export const trackRemoveFromCart = (itemId: string, itemName: string, category: string, price: number, quantity: number) => {
  analytics.track('remove_from_cart', {
    item_id: itemId,
    item_name: itemName,
    item_category: category,
    price,
    quantity,
    currency: 'PHP',
    value: price * quantity,
  });
};

export const trackViewItem = (itemId: string, itemName: string, category: string, price: number) => {
  analytics.track('view_item', {
    item_id: itemId,
    item_name: itemName,
    item_category: category,
    price,
    currency: 'PHP',
    value: price,
  });
};

export const trackBeginCheckout = (value: number, items: any[]) => {
  analytics.track('begin_checkout', {
    value,
    currency: 'PHP',
    items,
  });
};

// User engagement tracking
export const trackSearch = (searchTerm: string) => {
  analytics.track('search', {
    search_term: searchTerm,
  });
};

export const trackLogin = (method: string) => {
  analytics.track('login', {
    method,
  });
};

export const trackSignUp = (method: string) => {
  analytics.track('sign_up', {
    method,
  });
};

// Performance tracking
export const trackPageLoadTime = (loadTime: number) => {
  analytics.track('page_load_time', {
    value: Math.round(loadTime),
    load_time_ms: loadTime,
  });
};

// Error tracking
export const trackError = (error: string, fatal: boolean = false) => {
  analytics.track('error', {
    error_message: error,
    fatal,
  });
};

// Export analytics data (for your own analytics endpoint)
export const getAnalyticsData = () => {
  return analytics.events;
};

// Clear analytics data
export const clearAnalyticsData = () => {
  analytics.events = [];
};
