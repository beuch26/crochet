import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function checkImages({ container }: ExecArgs) {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  // Check all image URLs
  const allImages = await pg.raw("SELECT id, url FROM image WHERE deleted_at IS NULL ORDER BY url")
  const rows = allImages.rows || allImages[0]

  let local = 0
  let broken = 0
  const missingFiles: string[] = []

  for (const img of rows) {
    if (img.url && img.url.startsWith("/images/products/")) {
      local++
      // Extract the file name to check if it exists in our local files
      const fileName = img.url.replace("/images/products/", "")
      missingFiles.push(fileName)
    } else {
      broken++
      console.log("BROKEN:", img.url?.substring(0, 100))
    }
  }

  console.log("\n=== SUMMARY ===")
  console.log("Total:", rows.length)
  console.log("Local paths:", local)
  console.log("Still broken:", broken)

  // Now check which local paths actually have unique filenames
  const uniqueFiles = [...new Set(missingFiles)]
  console.log("\nUnique file names needed:", uniqueFiles.length)
  console.log("Sample:", uniqueFiles.slice(0, 20))
}
