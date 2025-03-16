import { renderHtml } from "./renderHtml";

let indexQuery = `SELECT * FROM user_provided_data WHERE Test_Index = (SELECT MAX(Test_Index) FROM user_provided_data)`;
let maxIndex = db.query(indexQuery);
let newIndex = maxIndex++;
let createQuery = `INSERT INTO user_provided_data (Test_Index) VALUES (?)`;


export default {
  async fetch(request, env) {
    db.query(createQuery).bind(newIndex)
  },

  async fetch(request, env) {
    const stmt = env.DB.prepare("SELECT * FROM user_provided_data LIMIT 10");
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
