export default {
  async fetch(request, env, context) {
    try {
      console.log("Received request");
      const url = new URL(request.url);
      const cf = request.cf || {};
      const clientIP = request.headers.get('cf-connecting-ip');
      const clientISP = cf.asOrganization || 'Unknown ISP';
      const clientRegion = cf.region || 'Unknown Region';
      const clientCountry = cf.country || 'Unknown Country';
      const clientCity = cf.city || 'Unknown City';

      console.log('Telemetry:', { clientIP, clientISP, clientRegion, clientCountry, clientCity });

      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "https://trevor-openspeedtest.pages.dev",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/telemetry") {
        return new Response(JSON.stringify({
          success: true,
          isp: clientISP,
          region: `${clientCity}, ${clientRegion}, ${clientCountry}`,
          ip: clientIP,
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://trevor-openspeedtest.pages.dev"
          }
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
        'Access-Control-Allow-Origin': 'https://trevor-openspeedtest.pages.dev', 
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
    "agreeToShare",
    "sanitizeCount",
    "timestamp",
    "IP"
  ]
  const sqlFieldsNum = sqlFields.length; //number of sql fields in records, for iterations

  var inboundData = [
    "0",
    "individual",
    "5555",
    "street name",
    "unit 1",
    "city",
    "state",
    "95370",
    "firstname",
    "lastname",
    "email@domain.com",
    "reportedISP",
    "300",
    "30",
    "278",
    "24",
    "30",
    "5",
    "detectedISP",
    "geolocated",
    "37.99606 -130.40737",
    "censusdata",
    "full address, well formatted, USA",
    "orgname",
    "agree",
    "0",
    "timestamp",
    "0.0.0.0"
  ];
  
  console.log('Received data:', payload); //LOGGING for the input data

  let sanitizeCount = 0;

  function checkSanitize(sanitized, input, fieldName = "unknown") {
    if (sanitized != input) {
      sanitizeCount++;
    }
    return sanitizeCount;
  };

  //call santize function on input, returning
  inboundData = payload.map((value, index) => {
    const clean = sanitizeInput(value);
    checkSanitize(clean, value, sqlFields[index] || `field_${index}`);
    return clean;
  });
  
  inboundData.push(sanitizeCount); //Adds count to end of array
  
  let indexQuery = `SELECT MAX(indexnum) AS maxIndex FROM data_table;`;
  let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;
  let timeQuery = `UPDATE data_table SET timestamp = datetime('now', 'utc') WHERE indexnum = ?;`;

  const { results: indexResults } = await env.DB.prepare(indexQuery).all();
  let currentIndex = indexResults[0]?.maxIndex ?? -1;
  let newIndex = currentIndex + 1;
  //console.log("Current Index:", currentIndex);
  //console.log("New Index:", newIndex);

  await env.DB.prepare(createQuery).bind(newIndex).run();
  await env.DB.prepare(timeQuery).bind(newIndex).run();

  //Extract the address field from inboundData, index 22 = "FullAddress"
  const addressToMatch = inboundData[22];

  //Query the max testnum where address matches, increment testnum
  const testnumQuery = `SELECT MAX(testnum) AS maxTestnum FROM data_table WHERE FullAddress = ?;`;
  const { results: testnumResults } = await env.DB.prepare(testnumQuery).bind(addressToMatch).all();
  let currentMaxTestnum = Number(testnumResults[0]?.maxTestnum ?? 0);
  let newTestnum = currentMaxTestnum + 1;

  //Pass back to inboundData before the loop
  inboundData[0] = newTestnum.toString();  // index 0 = "testnum"

  for (let i = 0; i < sqlFieldsNum; i++) {
    let curRow = newIndex;
    let curField = sqlFields[i];
    let curData = inboundData[i];
    await env.DB.prepare(`UPDATE data_table SET ${curField} = ? WHERE indexnum = ?;`).bind(curData, curRow).run();
    //console.log("Iteration:", i, " , Row:", curRow, " , Field:", curField, " , Data:", curData);
  }
  return { success: true, index: newIndex };
};

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  let sanitized = input.replace(/https?:\/\/\S+/gi, '');   // Remove URLs
  sanitized = sanitized.replace(/['";]+/g, '');   // Remove quotes and semicolons
  // Remove control characters and emojis
  sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F\uD800-\uDFFF\u2600-\u27BF]/g, '');
  const sqlKeywords = [
    "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "EXEC",
    "FROM", "WHERE", "DATABASE", "CREATE"
  ];   // Remove common SQL keywords (case-insensitive, whole words)

  sqlKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://trevor-openspeedtest.pages.dev"
    }
  });

  return sanitized.trim();
}