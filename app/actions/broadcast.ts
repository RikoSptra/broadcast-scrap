"use server";

import { revalidatePath } from "next/cache";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4333/api",
});

interface BroadcastMessage {
  type: "text" | "image" | "document";
  content: string;
  file?: string;
}

interface Broadcast {
  id: string;
  name: string;
  description: string;
  messages: BroadcastMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface CreateBroadcastInput {
  name: string;
  description: string;
  messages: {
    type: "text" | "image" | "document";
    content: string;
    file?: File;
    existingFile?: string;
  }[];
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function createBroadcast(
  input: CreateBroadcastInput
): Promise<Broadcast> {
  try {
    const messages = await Promise.all(
      input.messages.map(async (message) => {
        let base64File;
        if (message.file) {
          base64File = await fileToBase64(message.file);
        }

        return {
          type: message.type,
          content: message.content,
          file: base64File,
        };
      })
    );

    const { data } = await api.post(
      "/broadcast",
      {
        name: input.name,
        description: input.description,
        messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    revalidatePath("/broadcast");
    return data.data;
  } catch (error) {
    console.error("Error creating broadcast:", error);
    throw new Error("Failed to create broadcast");
  }
}

// Get All Broadcasts
export async function getBroadcasts(): Promise<Broadcast[]> {
  try {
    const { data } = await api.get("/broadcast", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data.data;
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    throw new Error("Failed to fetch broadcasts");
  }
}

// Get Single Broadcast
export async function getBroadcast(id: string): Promise<Broadcast | null> {
  try {
    const { data } = await api.get(`/broadcast/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching broadcast:", error);
    throw new Error("Failed to fetch broadcast");
  }
}

export async function getBroadcastById(id: string): Promise<Broadcast> {
  try {
    const { data } = await api.get(`/broadcast/${id}`);
    return data.data;
  } catch (error) {
    console.error("Error getting broadcast:", error);
    throw new Error("Failed to get broadcast");
  }
}

interface ScrapResult {
  totalContacts: number;
  contacts: string[];
}

export async function scrapGoogleMaps(
  broadcastId: string,
  searchQuery: string
): Promise<ScrapResult> {
  try {
    const { data } = await api.post(`/broadcast/${broadcastId}/scrap`, {
      searchQuery,
    });
    return data.data;
  } catch (error) {
    console.error("Error scraping Google Maps:", error);
    throw new Error("Failed to scrap Google Maps");
  }
}

export async function runBroadcast(id: string): Promise<void> {
  try {
    await api.post(`/broadcast/${id}/run`);
  } catch (error) {
    console.error("Error running broadcast:", error);
    throw new Error("Failed to run broadcast");
  }
}

// Update Broadcast
export async function updateBroadcast(
  id: string,
  input: CreateBroadcastInput
): Promise<Broadcast> {
  try {
    const messages = await Promise.all(
      input.messages.map(async (message) => {
        let base64File;
        if (message.file) {
          base64File = await fileToBase64(message.file);
        }

        return {
          type: message.type,
          content: message.content,
          file: base64File,
          existingFile: message.existingFile,
        };
      })
    );

    const { data } = await api.put(
      `/broadcast/${id}`,
      {
        name: input.name,
        description: input.description,
        messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    revalidatePath("/broadcast");
    return data.data;
  } catch (error) {
    console.error("Error updating broadcast:", error);
    throw new Error("Failed to update broadcast");
  }
}

// Delete Broadcast
export async function deleteBroadcast(id: string): Promise<void> {
  try {
    await api.delete(`/broadcast/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    revalidatePath("/broadcast");
  } catch (error) {
    console.error("Error deleting broadcast:", error);
    throw new Error("Failed to delete broadcast");
  }
}
