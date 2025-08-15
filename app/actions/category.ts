import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4333/api",
});
interface CreateCategoryInput {
  name: string;
}
interface Category {
  _id: string;
  name: string;
}

export async function getAllCategory(): Promise<Category[]> {
  try {
    const { data } = await api.get("/category");
    return data.data;
  } catch (error) {
    console.error("Error getting all category:", error);
    throw new Error("Failed to get all category");
  }
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<string> {
  try {
    const { data } = await api.post(
      "/category",
      {
        name: input.name,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return "ok";
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

export async function updateCategory(
  _id: String,
  input: CreateCategoryInput
): Promise<string> {
  try {
    await api.put(
      `/category/${_id}`,
      {
        name: input.name,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return "ok";
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

// Delete Broadcast
export async function deleteCategory(id: string): Promise<void> {
  try {
    await api.delete(`/category/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}
