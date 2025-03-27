export default {
  async fetch(request, env, context) {
    return handleRequest(request, env, context);
  }
};

async function handleRequest(request, env, event) {
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

  try {
    const requestData = await request.json();
    console.log('Received data:', requestData);

    // Execute your code here using the received data
    inboundData = requestData;
    let indexQuery = `SELECT MAX(indexnum) AS maxIndex FROM data_table;`;
    let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;

    const { results: indexResults } = await env.DB.prepare(indexQuery).all();
    let currentIndex = indexResults[0]?.maxIndex ?? -1;
    let newIndex = currentIndex + 1;
    console.log("Current Index:", currentIndex);
    console.log("New Index:", newIndex);

    await env.DB.prepare(createQuery).bind(newIndex).run();
    
    for (let i = 0; i < sqlFields.length; i++) {
      let curRow = newIndex;
      let curField = sqlFields[i];
      let curData = inboundData[i];
      await env.DB.prepare(`UPDATE data_table SET ${curField} = ? WHERE indexnum = ?;`).bind(curData, curRow).run();
      console.log("Iteration:", i, " , Row:", curRow, " , Field:", curField, " , Data:", curData);
    }

    return new Response("Data processed successfully", { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}