import { renderHtml } from "./renderHtml";

const sqlFields = [
  "testnum",
  "entity",
  "streetnum",
  "street",
  "unitapt",
  "city",
  "state_US",
  "zip",
  "firstname",
  "lastname",
  "email",
  "ISP",
  "plandown",
  "planup",
  "testdown",
  "testup",
  "testlatency",
  "testjitter",
  "detectedISP",
  "detectedregion",
  "geolocation",
  "censusblock"
]

var inboundData = [
  "0",
  "individual",
  "10893",
  "Martin Terrace Ct",
  "",
  "Sonora",
  "CA",
  "95370",
  "Trevor",
  "Gregg",
  "Trevor@TrevorAmesGregg.com",
  "Comcast",
  "300",
  "30",
  "278",
  "24",
  "30",
  "5",
  "Comcast",
  "CA",
  "37.99606, -120.40737",
  ""
];


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

export default {
  function processData(data) {
    // Your code to process the data
    inboundData = { data };
    let indexQuery = `SELECT MAX(indexnum) AS maxIndex FROM data_table;`;
    let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;
  
    const { results: indexResults } = await env.DB.prepare(indexQuery).all();
    
    let currentIndex = indexResults[0]?.maxIndex ?? -1;
    console.log("Current Index:", currentIndex);
    
    let newIndex = currentIndex + 1;
    console.log("New Index:", newIndex);
  
    await env.DB.prepare(createQuery).bind(newIndex).run();
    
    let i: number = 0;
    while (i < 22) {
      let curRow = newIndex;
      let curField = sqlFields[i];
      let curData = inboundData[i];
  
      await env.DB.prepare(`UPDATE data_table SET ${curField} = ? WHERE indexnum = ?;`).bind(curData, curRow).run();
  
      console.log("Iteration:", i, " , Row:", curRow, " , Field:", curField, " , Data:", curData);
      i++;
    };
  
    let displayQuery = `SELECT * FROM data_table LIMIT 10;`;
    const { results } = await env.DB.prepare(displayQuery).all();
    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
     
    return `Processed: ${data.message}, ${data.value * 2}`;
  };

  async function handleRequest(event) {
    if (event.request.method === 'POST' && event.request.url.endsWith('/dataStore')) { // Match the route
      try {
        const requestData = await event.request.json();
        console.log('Received data:', requestData);
  
        // Execute your code here using the received data
        const result = processData(requestData);
  
        return new Response(JSON.stringify({ message: 'Data processed successfully', result: result }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to process data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return new Response("Not Found.", {status: 404});
  }
  
/*
  async fetch(request, env) {
    let indexQuery = `SELECT MAX(indexnum) AS maxIndex FROM data_table;`;
    let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;
  
    const { results: indexResults } = await env.DB.prepare(indexQuery).all();
    
    let currentIndex = indexResults[0]?.maxIndex ?? -1;
    console.log("Current Index:", currentIndex);
    
    let newIndex = currentIndex + 1;
    console.log("New Index:", newIndex);

    await env.DB.prepare(createQuery).bind(newIndex).run();
    
    let i: number = 0;
    while (i < 22) {
      let curRow = newIndex;
      let curField = sqlFields[i];
      let curData = dummyData[i];

      await env.DB.prepare(`UPDATE data_table SET ${curField} = ? WHERE indexnum = ?;`).bind(curData, curRow).run();

      console.log("Iteration:", i, " , Row:", curRow, " , Field:", curField, " , Data:", curData);
      i++;
    }




    let displayQuery = `SELECT * FROM data_table LIMIT 10;`;
    const { results } = await env.DB.prepare(displayQuery).all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
*/

} satisfies ExportedHandler<Env>;
