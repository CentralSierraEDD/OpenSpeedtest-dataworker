import { WorkerEntrypoint } from "cloudflare:workers";
var payload = "";

export default class WorkflowsService extends WorkerEntrypoint {
  // Currently, entrypoints without a named handler are not supported
  async fetch(env) {
    return new Response(null, { status: 404 });
  }

  async createInstance(payload, env) {
    let instance = await this.env.dataWorker.create({
      params: payload,
    });

    return Response.json({
      id: instance.id,
      details: await instance.status(),
    });
  }
}

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
  "censusdata"
];
const sqlFieldsNum = sqlFields.length;
const requestData = payload;
console.log('Received data:', requestData);

var inboundData = requestData;
let indexQuery = `SELECT MAX(indexnum) AS maxIndex FROM data_table;`;
let createQuery = `INSERT INTO data_table (indexnum) VALUES (?);`;

const { results: indexResults } = await env.DB.prepare(indexQuery).all();
let currentIndex = indexResults[0]?.maxIndex ?? -1;
let newIndex = currentIndex + 1;
console.log("Current Index:", currentIndex);
console.log("New Index:", newIndex);

await env.DB.prepare(createQuery).bind(newIndex).run();

for (let i = 0; i < sqlFieldsNum; i++) {
  let curRow = newIndex;
  let curField = sqlFields[i];
  let curData = inboundData[i];
  await env.DB.prepare(`UPDATE data_table SET ${curField} = ? WHERE indexnum = ?;`).bind(curData, curRow).run();
  console.log("Iteration:", i, " , Row:", curRow, " , Field:", curField, " , Data:", curData);
}