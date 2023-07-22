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

app.operation('times', (data, resolve, options) => {
  const output = data * (options?.x as number || 1)
  resolve(output);
});

app.operation('log', (data, resolve, options) => {
  console.log(data);
  resolve(data);
});


const schema: ProcessSchema = {
  id: 1,
  name: "ProcessNumbers",
  type: "process",
  dataEntry: "PRC.1:$dataEntry",
  output: "PRC.1:$resolve",
  components: [{
    id: 2,
    type: "filter",
    name: "GreaterThan",
    input: "PRC.1:$dataEntry",
    output: {
      resolve: "FL.2:$resolve",
      reject: "FL.2:$reject"
    },
    criteria: {
      filter: 35
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
    output: "MRG.5:$resolve"
  },{
    id: 6,
    type: "operation",
    name: "log",
    input: "MRG.5:$resolve",
    options: {
      label: "FINAL DESTINATION"
    }
  }]
}

const process = app.loadSchema(schema);

process([10])

