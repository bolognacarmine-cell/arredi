import { describe, expect, it } from "vitest"

import { SITE_GEO, fallbackSiteSettings } from "./siteConfig"

describe("SITE_GEO", () => {
  it("coincide con le coordinate dell'embed Google Maps", () => {
    // `!2d` = longitudine, `!3d` = latitudine nell'URL di Google Maps.
    const match = /!2d(-?[\d.]+)!3d(-?[\d.]+)/.exec(fallbackSiteSettings.mapEmbedSrc)

    expect(match).not.toBeNull()
    expect(Number(match?.[2])).toBeCloseTo(SITE_GEO.latitude, 5)
    expect(Number(match?.[1])).toBeCloseTo(SITE_GEO.longitude, 5)
  })
})
