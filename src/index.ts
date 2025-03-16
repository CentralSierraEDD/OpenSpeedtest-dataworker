import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    let indexQuery = `SELECT indexnum FROM data_table WHERE indexnum = (SELECT MAX(indexnum) FROM data_table);`;
    let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;
    let displayQuery = `SELECT * FROM data_table LIMIT 10;`;
    
    const stmt3 = env.DB.prepare(indexQuery);
    const { results3 } = await stmt3.all();

    let maxIndex = await JSON.stringify(results3, null, 2);
    
    await console.log("stmt3: ", stmt3);
    await console.log("results type: ", typeof maxIndex)
    await console.log("results of query: ", maxIndex);
    
    let newIndex = maxIndex++;
    
    console.log("newIndex is: ", newIndex);

    const stmt2 = env.DB.prepare(createQuery).bind(newIndex);
    const { results2 } = await stmt2.all();

    const stmt = env.DB.prepare(displayQuery);
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
