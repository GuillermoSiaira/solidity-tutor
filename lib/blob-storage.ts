// Mock blob storage functions when Vercel Blob is not configured
const createMockBlobStorage = () => ({
  uploadContract: async (name: string, code: string, userId: string): Promise<string> => {
    console.warn("Vercel Blob not configured. Contract not uploaded.")
    return `mock://contracts/${userId}/${name}-${Date.now()}.sol`
  },

  uploadExample: async (name: string, code: string, description: string): Promise<string> => {
    console.warn("Vercel Blob not configured. Example not uploaded.")
    return `mock://examples/${name}-${Date.now()}.sol`
  },

  listUserContracts: async (userId: string) => {
    console.warn("Vercel Blob not configured. Returning empty list.")
    return []
  },

  deleteContract: async (url: string) => {
    console.warn("Vercel Blob not configured. Contract not deleted.")
    return false
  },
})

// Check if Vercel Blob is configured
const isBlobConfigured = () => {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

export async function uploadContract(name: string, code: string, userId: string): Promise<string> {
  if (!isBlobConfigured()) {
    return createMockBlobStorage().uploadContract(name, code, userId)
  }

  try {
    const { put } = await import("@vercel/blob")
    const filename = `contracts/${userId}/${name}-${Date.now()}.sol`
    const blob = await put(filename, code, {
      access: "public",
      contentType: "text/plain",
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading contract:", error)
    throw new Error("Failed to upload contract")
  }
}

export async function uploadExample(name: string, code: string, description: string): Promise<string> {
  if (!isBlobConfigured()) {
    return createMockBlobStorage().uploadExample(name, code, description)
  }

  try {
    const { put } = await import("@vercel/blob")
    const filename = `examples/${name}-${Date.now()}.sol`
    const contractData = {
      code,
      description,
      createdAt: new Date().toISOString(),
    }

    const blob = await put(filename, JSON.stringify(contractData, null, 2), {
      access: "public",
      contentType: "application/json",
    })

    return blob.url
  } catch (error) {
    console.error("Error uploading example:", error)
    throw new Error("Failed to upload example")
  }
}

export async function listUserContracts(userId: string) {
  if (!isBlobConfigured()) {
    return createMockBlobStorage().listUserContracts(userId)
  }

  try {
    const { list } = await import("@vercel/blob")
    const { blobs } = await list({
      prefix: `contracts/${userId}/`,
    })

    return blobs
  } catch (error) {
    console.error("Error listing contracts:", error)
    return []
  }
}

export async function deleteContract(url: string) {
  if (!isBlobConfigured()) {
    return createMockBlobStorage().deleteContract(url)
  }

  try {
    const { del } = await import("@vercel/blob")
    await del(url)
    return true
  } catch (error) {
    console.error("Error deleting contract:", error)
    return false
  }
}
