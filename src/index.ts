import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    env.DB.query(createQuery).bind(newIndex);
    let indexQuery = `SELECT * FROM user_provided_data WHERE Test_Index = (SELECT MAX(Test_Index) FROM user_provided_data)`;
    let maxIndex = env.DB.query(indexQuery);
    let newIndex = maxIndex++;
    let createQuery = `INSERT INTO user_provided_data (Test_Index) VALUES (?)`;
    const stmt = env.DB.prepare("SELECT * FROM user_provided_data LIMIT 10");
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
