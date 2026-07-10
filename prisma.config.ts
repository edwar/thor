export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL || process.env.DIRECT_DATABASE_URL || "",
  },
})
