import { Streamwise } from "../index";
import { ProcessSchema } from "../types";


const app = new Streamwise<number>({
  host: 'redis-do-user-9799822-0.b.db.ondigitalocean.com',
  port: 25061,
  username: 'default',
  password: 'AVNS_HOrdFKMcaQYj4zQ7s1Z',
  tls: {
    rejectUnauthorized: true,
  },
  enableTLSForSentinelMode: false,
});

app.filter('GreaterThan', (data, criteria, resolve, reject) => {
  if (data > criteria.filter) {
    resolve(data)
  } else {
    reject(data)
  }
});

app.operation('log', (data, resolve, options) => {
  console.log(`# ${data} is ${options?.label}`);
  resolve(data);
});

const schema: ProcessSchema = {
  id: 1,
  name: "procesNumbers",
  type: "process",
  inbound: "PRC.1:$inbound",
  outbound: "PRC.1:$outbound",
  components: [{
    id: 2,
    type: "filter",
    name: "GreaterThan",
    input: "PRC.1:$inbound",
    output: {
      resolve: "FL.2:$resolve",
      reject: "FL.2:$reject"
    },
    criteria: {
      filter: 50
    }
  },{
    id: 3,
    type: "operation",
    name: "log",
    input: "FL.2:$resolve",
    output: "OP.3:$resolve",
    options: {
      label: "Marked As Greater"
    }
  },{
    id: 4,
    type: "operation",
    name: "log",
    input: "FL.2:$reject",
    output: "OP.4:$resolve",
    options: {
      label: "Marked As Lower"
    }
  }, {
    id:5 ,
    type: 'merger',
    name: 'log_merger',
    inputs: [
      "OP.3:$resolve",
      "OP.4:$resolve",
    ],
    output: "PRC.1:$outbound"
  }]
}

const process = app.loadSchema(schema);

process.inbound([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);

process.on('outbound', (data: number) => {
  console.log(`outbound: ${data} `);
})

// process.on('progress', (step, data, progress) => {
//   console.log("progress", step, data, progress)
// })

process.on('failed', (error: Error) => {
  console.log("failed", error)
})
