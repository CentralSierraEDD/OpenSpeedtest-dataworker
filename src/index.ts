import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    let indexQuery = `SELECT indexnum FROM data_table WHERE indexnum = (SELECT MAX(indexnum) FROM data_table);`;
    let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;
  
    const sqlResult = await env.DB.prepare(indexQuery).all();

    console.log("sqlResult: ", sqlResult[0]);
    console.log("sqlResult type: ", typeof sqlResult);

    let currentIndex = sqlResult.length > 0 ? sqlResult[0].indexnum : 0;

    console.log("currentIndex is: ", currentIndex);

    let newIndex = currentIndex + 1;
  
    console.log("newIndex is: ", newIndex);

    await env.DB.prepare(createQuery).bind(newIndex).run();
    
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
