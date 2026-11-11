import {
  Property,
  PropertyDetail,
  PropertyTransaction,
  Locality,
  ValuationRequest,
  ValuationResponse,
  FairPriceAssessment,
  Business,
  BusinessGrowthStats,
  EMICalculatorResponse,
  InvestmentOpportunity
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `API error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Properties & Listings
  getProperties: async (params?: Record<string, string | number | undefined>): Promise<Property[]> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") query.append(k, String(v));
      });
    }
    const qStr = query.toString();
    return request<Property[]>(`/properties${qStr ? `?${qStr}` : ""}`);
  },

  getPropertyDetail: async (id: string): Promise<PropertyDetail> => {
    return request<PropertyDetail>(`/properties/${id}`);
  },

  // Recently Sold
  getTransactions: async (params?: Record<string, string | number | undefined>): Promise<PropertyTransaction[]> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") query.append(k, String(v));
      });
    }
    const qStr = query.toString();
    return request<PropertyTransaction[]>(`/transactions${qStr ? `?${qStr}` : ""}`);
  },

  getTransactionStats: async (locality?: string) => {
    return request<{
      total_transactions: number;
      avg_price_sqft: number;
      min_price_sqft: number;
      max_price_sqft: number;
      median_price: number;
      last_updated_date?: string;
    }>(`/transactions/stats${locality ? `?locality=${locality}` : ""}`);
  },

  // Neighbourhoods
  getNeighbourhoods: async (): Promise<Locality[]> => {
    return request<Locality[]>("/neighbourhoods");
  },

  getNeighbourhoodDetail: async (slugOrId: string): Promise<Locality> => {
    return request<Locality>(`/neighbourhoods/${slugOrId}`);
  },

  // AI Valuation & Fair Price
  estimateValuation: async (data: ValuationRequest): Promise<ValuationResponse> => {
    return request<ValuationResponse>("/valuation/estimate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  analyseFairPrice: async (data: {
    locality_id: string;
    asking_price: number;
    carpet_area_sqft: number;
    property_type?: string;
    bedrooms?: number;
    property_age_years?: number;
  }): Promise<FairPriceAssessment> => {
    return request<FairPriceAssessment>("/fair-price/analyse", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Businesses
  getBusinesses: async (params?: Record<string, string | undefined>): Promise<Business[]> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    const qStr = query.toString();
    return request<Business[]>(`/businesses${qStr ? `?${qStr}` : ""}`);
  },

  getBusinessGrowth: async (): Promise<BusinessGrowthStats[]> => {
    return request<BusinessGrowthStats[]>("/businesses/growth");
  },

  // Investment
  getInvestmentOpportunities: async (params?: Record<string, string | number | undefined>): Promise<InvestmentOpportunity[]> => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") query.append(k, String(v));
      });
    }
    const qStr = query.toString();
    return request<InvestmentOpportunity[]>(`/investment/opportunities${qStr ? `?${qStr}` : ""}`);
  },

  // Calculators
  calculateEMI: async (data: {
    property_price: number;
    down_payment_pct: number;
    annual_interest_rate: number;
    loan_tenure_years: number;
    registration_stamp_duty_pct: number;
  }): Promise<EMICalculatorResponse> => {
    return request<EMICalculatorResponse>("/calculator/emi", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Comparisons
  comparePropertiesMatrix: async (propertyIds: string[]): Promise<any[]> => {
    return request<any[]>("/comparisons/matrix", {
      method: "POST",
      body: JSON.stringify(propertyIds),
    });
  },

  // PDF Download
  downloadValuationPDF: async (data: ValuationRequest): Promise<Blob> => {
    const res = await fetch(`${API_BASE}/reports/valuation/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to download PDF report");
    return res.blob();
  },

  // Admin
  getAdminStats: async () => {
    return request<any>("/admin/stats");
  },
};

