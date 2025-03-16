import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    let indexQuery = `SELECT * FROM dataTable WHERE index = (SELECT MAX(index) FROM dataTable);`;
    let createQuery = `INSERT INTO dataTable (index) VALUES (?);`;
    let maxIndex = env.DB.prepare(indexQuery);
    let newIndex = maxIndex++;
    const stmt2 = env.DB.prepare(createQuery).bind(newIndex);
    const { results2 } = await stmt2.all();
    const stmt = env.DB.prepare("SELECT * FROM dataTable LIMIT 10");
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
