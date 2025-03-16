import { renderHtml } from "./renderHtml";

async fetch(request, env) {
  let indexQuery = `SELECT indexnum FROM data_table WHERE indexnum = (SELECT MAX(indexnum) FROM data_table);`;
  let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;

  const stmt3 = env.DB.prepare(indexQuery);
  const { results3 } = JSON.stringify(stmt3);

  console.log("results3: ", results3);
  console.log("results3 type: ", typeof results3);

  let newIndex = JSON.stringify(results3) + 1;

  console.log("newIndex is: ", newIndex);

  const stmt2 = env.DB.prepare(createQuery).bind(newIndex);
  const { results2 } = await stmt2.all();
}

export default {
  async fetch(request, env) {
    let displayQuery = `SELECT * FROM data_table LIMIT 10;`;
    const stmt = env.DB.prepare(displayQuery);
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
