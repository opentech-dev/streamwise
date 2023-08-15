import { Streamwise } from "../index";
import { ProcessSchema } from "../types";


type Domain = {
  id: number,
  name: string,
  tf?: number,
  dr?: number,
  tld?: string,
  labels: string[],
}


const app = new Streamwise<Domain>({
  host: 'redis-do-user-9799822-0.b.db.ondigitalocean.com',
  port: 25061,
  username: 'default',
  password: 'AVNS_HOrdFKMcaQYj4zQ7s1Z',
  tls: {
    rejectUnauthorized: true,
  },
  enableTLSForSentinelMode: false,
});

// DEFINE RESOURCES

app.filter('FilterDomain', (domain, criteria, resolve, reject) => {
  for (let key in criteria) {
    //@ts-ignore
    if (domain[key] < criteria[key]) {
      reject(domain)
      return;
    }
  }
  resolve(domain);
});

app.operation('Moz', (data, resolve, options) => {
  const tf = Math.floor(Math.random() * 100);
  resolve({ ...data, tf });
});

app.operation('Maj', (data, resolve, options) => {
  const dr = Math.floor(Math.random() * 100);
  resolve({ ...data, dr });
});

app.operation('TLD', (data, resolve, options) => {
  const tld = data.name.split('.').pop();
  resolve({ ...data, tld });
});

app.operation('label', (data, resolve, options) => {
  if (options?.label) {
    data.labels.push(options?.label);
  }
  resolve(data);
});


// DEFINE PROCESS SCHEMA

const schema: ProcessSchema = {
  id: 1,
  name: "procesDomains",
  type: "process",
  inbound: "PRC.1:$inbound",
  outbound: "PRC.1:$outbound",
  components: [{
    id: 2,
    type: "operation",
    name: "TLD",
    input: "PRC.1:$inbound",
    output: "OP.2:$resolve",
  },
  {
    id: 3,
    type: "operation",
    name: "Moz",
    input: "OP.2:$resolve",
    output: "OP.3:$resolve",
  }, {
    id: 4,
    type: "filter",
    name: "FilterDomain",
    input: "OP.3:$resolve",
    output: {
      resolve: "FL.4:$resolve",
      reject: "FL.4:$reject"
    },
    criteria: {
      tf: 50
    }
  }, {
    id: 5,
    type: "operation",
    name: "Maj",
    input: "FL.4:$resolve",
    output: "OP.5:$resolve",
  }, {
    id: 6,
    type: "filter",
    name: "FilterDomain",
    input: "OP.5:$resolve",
    criteria: {
      dr: 50
    },
    output: {
      resolve: "FL.6:$resolve",
      reject: "FL.6:$reject"
    },
  },
  {
    id: 7,
    type: 'merger',
    name: 'reject_merger',
    inputs: [
      "FL.4:$reject",
      "FL.6:$reject"
    ],
    output: "MRG.7:$resolve"
  }, {
    id: 8,
    type: "operation",
    name: "label",
    options: {
      label: "rejected"
    },
    input: "MRG.7:$resolve",
    output: "OP.8:$resolve",
  },
  {
    id: 9,
    type: 'merger',
    name: 'output_merger',
    inputs: [
      "OP.8:$resolve",
      "FL.6:$resolve",
    ],
    output: "PRC.1:$outbound"
  }
]
}

const process = app.loadSchema(schema);

process.on('outbound', (data: Domain) => {
  console.log('outbound:', data);
})

process.on('failed', (error: Error) => {
  console.log("failed", error)
})


const arr = [];

const domainNames = [
  'google.com',
  'facebook.com',
  'youtube.com',
  'twitter.com',
  'amazon.com',
  'instagram.com',
  'linkedin.com',
  'netflix.com',
  'ebay.com',
  'wikipedia.org',
  'pinterest.com',
  'apple.com',
  'microsoft.com',
];

for (let i = 0; i < 500; i++) {
  const randomIndex = Math.floor(Math.random() * domainNames.length);
  arr.push({
    id: i,
    name: domainNames[randomIndex],
    labels: []
  });
}

process.inbound(arr);
