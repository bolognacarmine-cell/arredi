/**
 * Migration script to export localStorage data to the new API
 * 
 * Instructions:
 * 1. Open your application in a browser where you have localStorage data
 * 2. Open the browser console (F12)
 * 3. Copy and paste this entire script into the console
 * 4. The script will export all localStorage data to a JSON file
 * 5. Save the exported JSON file
 * 6. Use the import script to load the data into the new API
 */

(function exportLocalStorageData() {
  console.log("🔄 Starting localStorage data export...")

  const localStorageData: Record<string, any> = {}

  // Export all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      try {
        const value = localStorage.getItem(key)
        localStorageData[key] = value ? JSON.parse(value) : value
      } catch (error) {
        console.error(`Error parsing ${key}:`, error)
        localStorageData[key] = localStorage.getItem(key)
      }
    }
  }

  console.log("📦 Exported localStorage data:", localStorageData)

  // Create download link
  const dataStr = JSON.stringify(localStorageData, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `localstorage-export-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)

  console.log("✅ Export complete! Download the JSON file.")
})()

/**
 * Import script to load exported data into the new API
 * 
 * Instructions:
 * 1. After setting up the server and API, run this script
 * 2. It will read the exported JSON file and send data to the API
 */

async function importLocalStorageData(jsonFile: File, apiBaseUrl: string) {
  console.log("🔄 Starting localStorage data import...")

  try {
    const text = await jsonFile.text()
    const data = JSON.parse(text)

    console.log("📦 Imported localStorage data:", data)

    // Import media data
    if (data["farcom-recent-uploads"]) {
      console.log("🖼️  Importing media data...")
      for (const media of data["farcom-recent-uploads"]) {
        try {
          await fetch(`${apiBaseUrl}/api/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cloudinaryUrl: media.secureUrl,
              cloudinaryPublicId: media.publicId,
              title: media.titleHint,
              category: media.category,
              width: media.width,
              height: media.height,
            }),
          })
          console.log(`✅ Imported media: ${media.publicId}`)
        } catch (error) {
          console.error(`❌ Failed to import media ${media.publicId}:`, error)
        }
      }
    }

    // Import projects data
    if (data["farcom-projects"]) {
      console.log("🏗️  Importing projects data...")
      for (const project of data["farcom-projects"]) {
        try {
          await fetch(`${apiBaseUrl}/api/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(project),
          })
          console.log(`✅ Imported project: ${project.id}`)
        } catch (error) {
          console.error(`❌ Failed to import project ${project.id}:`, error)
        }
      }
    }

    // Import products data
    if (data["farcom-showroom-products-v2"]) {
      console.log("📦 Importing products data...")
      for (const product of data["farcom-showroom-products-v2"]) {
        try {
          await fetch(`${apiBaseUrl}/api/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
          })
          console.log(`✅ Imported product: ${product.id}`)
        } catch (error) {
          console.error(`❌ Failed to import product ${product.id}:`, error)
        }
      }
    }

    // Import offers data
    if (data["farcom-showroom-offers-v2"]) {
      console.log("🎉 Importing offers data...")
      for (const offer of data["farcom-showroom-offers-v2"]) {
        try {
          await fetch(`${apiBaseUrl}/api/offers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(offer),
          })
          console.log(`✅ Imported offer: ${offer.id}`)
        } catch (error) {
          console.error(`❌ Failed to import offer ${offer.id}:`, error)
        }
      }
    }

    // Import quotes data
    if (data["farcom-quotes"]) {
      console.log("📝 Importing quotes data...")
      for (const quote of data["farcom-quotes"]) {
        try {
          // Convert local quote format to API format
          const apiQuote = {
            id: `quote-${quote.id}`,
            customerName: `${quote.nome} ${quote.cognome}`,
            customerEmail: quote.email,
            customerPhone: quote.telefono,
            items: [
              {
                productId: "custom",
                productName: quote.arredo,
                quantity: 1,
                price: 0,
              },
            ],
            totalAmount: 0,
            status: quote.stato === "contattato" ? "confirmed" : quote.stato === "chiuso" ? "cancelled" : "pending",
            notes: quote.messaggio,
          }
          await fetch(`${apiBaseUrl}/api/quotes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiQuote),
          })
          console.log(`✅ Imported quote: ${quote.id}`)
        } catch (error) {
          console.error(`❌ Failed to import quote ${quote.id}:`, error)
        }
      }
    }

    // Import site settings
    if (data["farcom-site-settings"]) {
      console.log("⚙️  Importing site settings...")
      try {
        const settings = data["farcom-site-settings"]
        const apiSettings = {
          companyName: settings.brandName,
          contactEmail: settings.email.replace("mailto:", ""),
          contactPhone: settings.phone.replace("tel:", ""),
          address: `${settings.addressLine1}, ${settings.addressLine2}`,
          socialLinks: {
            facebook: settings.facebookHref,
            instagram: settings.instagramHref,
          },
        }
        await fetch(`${apiBaseUrl}/api/site-config`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiSettings),
        })
        console.log("✅ Imported site settings")
      } catch (error) {
        console.error("❌ Failed to import site settings:", error)
      }
    }

    console.log("🎉 Import complete!")
  } catch (error) {
    console.error("❌ Import failed:", error)
  }
}

// Export the import function for use
declare global {
  interface Window {
    importLocalStorageData: (file: File, apiBaseUrl: string) => Promise<void>
  }
}

window.importLocalStorageData = importLocalStorageData

console.log("📋 Migration functions loaded!")
console.log("Use: importLocalStorageData(file, 'http://localhost:3001')")
