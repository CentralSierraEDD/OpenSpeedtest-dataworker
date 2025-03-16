import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    let indexQuery = `SELECT indexnum FROM data_table WHERE indexnum = (SELECT MAX(indexnum) FROM data_table);`;
    let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;
  
    const sqlStmt = env.DB.prepare(indexQuery).all();
    const { sqlResult } = await sqlStmt.run();

    const { entries } = Object.entries(sqlResult);
    console.log("entries: ", entries);

    console.log("sqlResult: ", sqlResult);
    console.log("sqlResult type: ", typeof sqlResult);

    let { dbExport } = sqlResult;
    let currentIndex = dbExport;

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
