import { Streamwise } from "../index";
import { ProcessSchema } from "../types";

type El = {
  id: number,
  el: number
}

const app = new Streamwise<El>({
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
  if (data.el > criteria.filter) {
    resolve(data)
  } else {
    reject(data)
  }
});

app.operation('log', (data, resolve, options) => {
  console.log(`#${data.id} -> ${data.el} is ${options?.label}`);
  resolve(data);
});

const schema: ProcessSchema = {
  id: 1,
  name: "procesNr"+(new Date().getTime().toString(16)),
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


const arr: El[] = [];

for(let i = 0; i < 1000; i++) {
  arr[i] = {
    id: i,
    el: Math.floor(Math.random() * 100)
  }
}

const process = app.loadSchema(schema);

const part1 = arr.splice(0, 100);
const resp = new Map();
part1.forEach( (e:El) => resp.set(e.id, e.el))

process.inbound(part1);

let count = 0;
process.on('outbound', (nr:El) => {
  count +=1;
  console.log(`#${count} outbound: ${nr.el} `);

  resp.delete(nr.id);
  console.log("resp size", resp.size)

  if (resp.size < 5) {
    console.log("missing items", resp);
  }
  if (arr.length) {
    process.inbound(arr.splice(0, 1))
  }
})



