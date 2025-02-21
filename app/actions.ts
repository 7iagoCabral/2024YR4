"use server"

interface NeoResponse {
  near_earth_objects: {
    [date: string]: Array<{
      name: string
      close_approach_data: Array<{
        miss_distance: {
          astronomical: string
        }
        relative_velocity: {
          kilometers_per_second: string
        }
      }>
      estimated_diameter: {
        kilometers: {
          estimated_diameter_max: number
        }
      }
    }>
  }
}

export async function getNeoData() {
  const startDate = new Date().toISOString().split("T")[0]
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&api_key=${process.env.NASA_API_KEY}`

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch NEO data")
    const data: NeoResponse = await response.json()

    // Get the first date's NEOs
    const neos = Object.values(data.near_earth_objects)[0]

    return neos.map((neo) => ({
      name: neo.name,
      distance: Number.parseFloat(neo.close_approach_data[0].miss_distance.astronomical),
      velocity: Number.parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second),
      diameter: neo.estimated_diameter.kilometers.estimated_diameter_max,
    }))
  } catch (error) {
    console.error("Error fetching NEO data:", error)
    throw new Error("Failed to fetch asteroid data")
  }
}

