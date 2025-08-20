"use server";

import { revalidatePath } from "next/cache";
import axios from "axios";
import { getBaseUrl } from "@/lib/utils";

const api = axios.create({
  baseURL: "http://localhost:4333/api",
});

interface GoogleMapsScrapperResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export async function googleMapsScrapper(input: {
  searchQuery: string;
}): Promise<GoogleMapsScrapperResponse> {
  try {
    const { data } = await api.post(
      "/googleMapsScrapper",
      {
        searchQuery: input.searchQuery,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response:", data);

    return data;
  } catch (error) {
    console.error("Error calling googleMapsScrapper:", error);

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.message;
      throw new Error(`API Error: ${errorMessage}`);
    }

    throw new Error("Failed to call googleMapsScrapper");
  }
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface GoogleScrapResponse {
  success: boolean;
  data: any[];
  pagination: PaginationResponse;
}

export const getAllGoogleScrapData = async (
  params?: PaginationParams
): Promise<GoogleScrapResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);
  if (params?.category) searchParams.append("category", params.category);

  const { data } = await api.get(
    `/googleMapsScrapper?${searchParams.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return data;
};
