export default {
  async fetch(request, env, context) {
    try {
      console.log("Received request");

      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "https://trevor-openspeedtest.pages.dev",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Only POST method allowed" }), { 
          status: 405,
          headers: {
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "https://trevor-openspeedtest.pages.dev" 
          }
        });
      }

      const payload = await request.json();
      console.log("Received payload:", payload);

      const dbResponse = await addData(env, payload);

      return new Response(JSON.stringify({ success: true, data: dbResponse }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "https://trevor-openspeedtest.pages.dev" 
        },
      });

    } catch (error) {
      console.error("Error in Worker:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "https://trevor-openspeedtest.pages.dev" 
        },
      });
    }
    return new Response(result, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://trevor-openspeedtest.pages.dev', // or a specific origin like 'https://your-pages-site.com'
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",      },
    });
  }
};

async function addData(env, payload) {
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
    "censusblock",
    "FullAddress",
    "orgname",
  ]
  const sqlFieldsNum = sqlFields.length; //number of sql fields in records, for iterations

  var inboundData = [
    "0",
    "individual",
    "streetnum",
    "streetname",
    "unitnum",
    "city",
    "state",
    "zip",
    "firstname",
    "lastname",
    "email@domain.com",
    "reported ISP",
    "300",
    "30",
    "278",
    "24",
    "30",
    "5",
    "detected ISP",
    "geolocation",
    "37.99606, -120.40737",
    "censusdata",
    "fulladdress",
    "orgname",
  ];
  
  console.log('Received data:', payload); //LOGGING for the input data

  inboundData = payload;
  let indexQuery = `SELECT MAX(indexnum) AS maxIndex FROM data_table;`;
  let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;
  let timeQuery = `UPDATE data_table SET timestamp = datetime('now', 'localtime') WHERE indexnum = ?;`;

  const { results: indexResults } = await env.DB.prepare(indexQuery).all();
  let currentIndex = indexResults[0]?.maxIndex ?? -1;
  let newIndex = currentIndex + 1;
  //console.log("Current Index:", currentIndex);
  //console.log("New Index:", newIndex);

  await env.DB.prepare(createQuery).bind(newIndex).run();
  await env.DB.prepare(timeQuery).bind(newIndex).run();

  for (let i = 0; i < sqlFieldsNum; i++) {
    let curRow = newIndex;
    let curField = sqlFields[i];
    let curData = inboundData[i];
    await env.DB.prepare(`UPDATE data_table SET ${curField} = ? WHERE indexnum = ?;`).bind(curData, curRow).run();
    //console.log("Iteration:", i, " , Row:", curRow, " , Field:", curField, " , Data:", curData);
  }
  return { success: true, index: newIndex };
};