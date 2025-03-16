import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    let indexQuery = `SELECT indexnum FROM data_table WHERE indexnum = (SELECT MAX(indexnum) FROM data_table);`;
    let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;
    
    console.log("indexing query: ", indexQuery);
    console.log("record create query: ", createQuery);
    
    let maxIndex = env.DB.prepare(indexQuery);
    
    console.log("maxIndex is: ", maxIndex);
    
    let newIndex = maxIndex++;
    
    console.log("newIndex is: ", newIndex);
    
    const stmt2 = env.DB.prepare(createQuery).bind(newIndex);
    const { results2 } = await stmt2.all();
    
    const stmt = env.DB.prepare("SELECT * FROM data_table LIMIT 10");
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
