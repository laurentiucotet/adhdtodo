import { DataMigration } from "@/components/data-migration"

export default function MigratePage() {
  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Data Migration</h1>
      <DataMigration />
    </main>
  )
}

