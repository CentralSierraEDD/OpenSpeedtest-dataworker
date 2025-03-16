import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    let indexQuery = `SELECT MAX(indexnum) AS maxIndex FROM data_table;`;
    let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;
  
    const { results: indexResults } = await env.DB.prepare(indexQuery).all();
    
    let currentIndex = indexResults[0]?.maxIndex ?? -1;
    console.log("Current Index:", currentIndex);
    
    let newIndex = currentIndex + 1;
    console.log("New Index:", newIndex);

    await env.DB.prepare(createQuery).bind(newIndex).run();
    
    let displayQuery = `SELECT * FROM data_table LIMIT 10;`;
    const { results } = await env.DB.prepare(displayQuery).all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
