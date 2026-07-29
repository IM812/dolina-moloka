import postgres from "postgres"

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" })

const tables = await sql`
  select table_name
  from information_schema.tables
  where table_schema = 'public'
  order by table_name
`

console.log("TABLES:", tables.map((r) => r.table_name).join(", ") || "(none)")

for (const { table_name } of tables) {
  const cols = await sql`
    select column_name, data_type
    from information_schema.columns
    where table_schema = 'public' and table_name = ${table_name}
    order by ordinal_position
  `
  const count = await sql`select count(*)::int as c from ${sql(table_name)}`
  console.log(`\n${table_name} (${count[0].c} rows)`)
  console.log(cols.map((c) => `  ${c.column_name}: ${c.data_type}`).join("\n"))
}

await sql.end()
