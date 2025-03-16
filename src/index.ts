import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    let indexQuery = `SELECT * FROM user_provided_data WHERE Test_Index = (SELECT MAX(Test_Index) FROM user_provided_data)`;
    let createQuery = `INSERT INTO user_provided_data (Test_Index) VALUES (?)`;
    let maxIndex = env.DB.prepare(indexQuery);
    let newIndex = maxIndex++;
    const stmt = env.DB.prepare(createQuery).bind(newIndex);
    const { results } = await stmt.all();
    const stmt = env.DB.prepare("SELECT * FROM user_provided_data LIMIT 10");
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
