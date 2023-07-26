# StreamWise
StreamWise Core is a powerful and flexible pipeline library for data processing. It allows you to effortlessly build data pipelines that can handle any type of data, from simple numbers and strings to complex data structures.

## Features
- **Modular Components**: StreamWise provides a variety of components such as filters, operations, and mergers, allowing you to create custom pipelines tailored to your specific data processing needs.

- **JSON Representation**: Define your data processing pipeline using a JSON representation that provides a clear and concise way to specify the components, their interconnections, and the overall flow of data.

- **Versatility**: StreamWise is designed to be highly versatile, capable of processing diverse data types and handling complex data transformation tasks. 

## Installation
To get started with StreamWise
```
npm install @streamwise/core
```

Alternatively, if you prefer using yarn:
```
yarn add @streamwise/core
```

## Getting Started
Here's a simple example of how to use StreamWise:

```javascript
import { Streamwise } from '@streamwise/core';

// Your custom filter and operation functions
// (Not shown here, see documentation for details)

// Create the StreamWise application
const app = new Streamwise({
  host: 'redis-host',
  port: 6379,
  username: 'default',
  password: 'password',
});

// Add custom filter and operation functions
app.filter('MyCustomFilter', filterFunction);
app.operation('MyCustomOperation', operationFunction);

// Define your pipeline schema (JSON representation)
const schema = {
  // Your pipeline schema (example not shown here, see documentation for details)
};

// Load the schema into the application
const process = app.loadSchema(schema);

// Provide your data entities
const dataEntities = [/* Your data goes here */];

// Process the data through the pipeline
process(dataEntities);

```

# Documentation
StreamWise is a powerful data processing pipeline library designed to handle diverse data types with ease. With a flexible JSON representation, it allows effortless creation of pipelines by connecting modular components like filters, operations, and mergers. Process your data efficiently using custom functions and enjoy the versatility of StreamWise as it handles complex data transformation tasks effortlessly. Whether you're processing simple numbers or intricate data structures, StreamWise empowers you to build seamless data processing pipelines with exceptional ease and performance.

## Components:
StreamWise offers three core components for building data processing pipelines:

- **Process**: A Process in StreamWise represents the main data pipeline, comprising interconnected components for processing data entities.

- **Filters**: Filters evaluate data against user-defined criteria and split it into "resolved" and "rejected" channels based on the evaluation outcome.

- **Operations**: Operations perform custom actions on data received from filters or previous operations, enabling data transformation, logging, and more.

- **Mergers**: Mergers combine multiple channels of data into a single output, allowing seamless integration of different data streams.

These modular components provide the building blocks to construct powerful, flexible, and efficient data processing pipelines tailored to your specific needs.

## Process

A Process in StreamWise represents the main data pipeline, comprising interconnected components for processing data entities. It is the core structure that orchestrates the flow of data through the pipeline, from the inbound channel to the outbound channel.

### Schema

The Process component follows the JSON schema defined as `ProcessSchema`. Here are the properties used to configure a Process:

*   `id` (number|string, required): A unique identifier for the Process.
*   `name` (string, required): A descriptive name for the Process.
*   `type` (string, const: "process", required): Specifies the component type as "process."
*   `inbound` (string, required): The channel where data entities enter the Process.
*   `outbound` (string, required): The channel where processed data entities exit the Process.
*   `components` (ComponentsSchema[], required): An array of components (Filters, Operations, or Mergers) that form the Process.

### Example

```javascript 
import { StreamWise } from "@streamwise/core";

const app = new StreamWise({
  // Redis configuration
});

// Define custom Filters, Operations, and Mergers (if needed)

// Define a Schema for the Process
const schema = {
  id: 1,
  name: "DataProcessingPipeline",
  type: "process",
  inbound: "PRC.1:$inbound",
  outbound: "PRC.1:$outbound",
  components: [
    // Define the components and their interconnections here
  ],
};

// Load the Schema to create the Process
const process = app.loadSchema(schema);

// Provide a list of DataEntities as input to the Process
process([dataEntity1, dataEntity2, dataEntity3, /* ... */]);

```
In this example, a custom Process named "`DataProcessingPipeline`" is defined. It consists of a series of interconnected components (**Filters**, **Operations**, and **Mergers**) that process data entities as they flow through the pipeline. The Process takes an array of DataEntities as input and processes them accordingly, producing the final output through the outbound channel "`PRC.1:$outbound`". By defining and configuring components within the Process, you can design complex data processing workflows tailored to your specific application requirements.

___

## Filters

Filters are components in StreamWise that allow you to selectively include or exclude data entities based on specific criteria. They help streamline data processing pipelines by segmenting data into different channels, depending on whether they meet the filter's conditions.

### Schema

The Filter component follows the JSON schema defined as `FilterSchema`. Here are the properties used to configure a Filter:

*   `id` (number|string, required): A unique identifier for the Filter component.
*   `type` (string, const: "filter", required): Specifies the component type as "filter."
*   `name` (string, required): A descriptive name for the Filter component.
*   `input` (string, required): The input channel where the Filter component receives data entities.
*   `output` ([FilterOutput](#filteroutput), required): An object defining the output channels for resolved and rejected data entities.
*   `criteria` (any, required): The filter criteria represented as an object. The structure of this object depends on the custom Filter function defined.

### Filter Output

The `FilterOutput` schema is an object that specifies the output channels for resolved and rejected data entities:

*   `resolve` (string, required): The channel where data entities that meet the filter criteria will be sent.
*   `reject` (string, required): The channel where data entities that do not meet the filter criteria will be sent.

### Filter Function

A Filter component is powered by a custom filter function that implements the filtering logic. The filter function can be synchronous or asynchronous, depending on the use case. It receives the following parameters:

*   `data` (any): The data entity to be filtered.
*   `criteria` (any): The filter criteria provided in the Filter configuration.
*   `resolve` (Function): A callback function to resolve the data entity if it meets the criteria.
*   `reject` (Function): A callback function to reject the data entity if it does not meet the criteria.

### Example

```javascript
import { StreamWise } from "@streamwise/core";

const app = new StreamWise({
  // Redis configuration
});

// Add a custom Filter
app.filter('CustomFilter', async (data, criteria, resolve, reject) => {
  // Asynchronous filtering logic
  if (data > criteria.threshold) {
    resolve(data); // Data passes the filter
  } else {
    reject(data); // Data does not meet the criteria
  }
});

// Define a Schema for the Process
const schema = {
  id: 1,
  name: "DataProcessingPipeline",
  type: "process",
  inbound: "PRC.1:$inbound", 
  outbound: "PRC.1:$outbound", 
  components: [
    {
      id: 2,
      type: "filter",
      name: "CustomFilter",
      input: "PRC.1:$inbound",
      output: {
        resolve: "FL.2:$resolve",
        reject: "FL.2:$reject",
      },
      criteria: {
        threshold: 50, // Example criteria: filter data greater than 50
      },
    },
    // ... other components
  ],
};

// Load the Schema to create the Process
const process = app.loadSchema(schema);

// Provide a list of DataEntities
process([10, 20, 30, 40, 50, 60]);

```

By leveraging Filters, you can efficiently route and process data entities in StreamWise's data processing pipeline based on specific criteria, enabling better data management and analysis.
___

## Operations

Operations are components in StreamWise that allow you to process data entities as they pass through the pipeline. They enable you to perform various actions on the data, such as logging, transformation, or custom operations.

### Schema

The Operation component follows the JSON schema defined as `OperationSchema`. Here are the properties used to configure an Operation:

*   `id` (number|string, required): A unique identifier for the Operation component.
*   `type` (string, const: "operation", required): Specifies the component type as "operation."
*   `name` (string, required): A descriptive name for the Operation component.
*   `input` (string, required): The input channel where the Operation component receives data entities.
*   `output` (string): The channel where processed data entities will be sent (optional).
*   `options` (any): Additional options or parameters for the Operation function (optional).

### Operation Function

An Operation component is powered by a custom operation function that implements the data processing logic. The operation function can be synchronous or asynchronous, depending on the use case. It receives the following parameters:

*   `data` (any): The data entity to be processed.
*   `resolve` (Function): A callback function to pass the processed data entity to the next component.
*   `options` (any): Additional options or parameters provided in the Operation configuration (optional).

### Example
```javascript
import { StreamWise } from "@streamwise/core";

const app = new StreamWise({
  // Redis configuration
});

// Add custom Operation "times"
app.operation('times', (data, resolve, options) => {
  const multiplier = options?.x || 1;
  const output = data * multiplier;
  resolve(output); // Pass processed data to the next component
});

// Add custom Operation "log"
app.operation('log', (data, resolve, options) => {
  console.log(options?.label, data);
  resolve(data); // Pass processed data to the next component
});

// Define a Schema for the Process
const schema = {
  id: 1,
  name: "DataProcessingPipeline",
  type: "process",
  inbound: "PRC.1:$inbound",
  outbound: "PRC.1:$outbound",
  components: [
    {
      id: 2,
      type: "operation",
      name: "times",
      input: "PRC.1:$inbound",
      output: "OP.2:$resolve",
      options: {
        x: 5, // Example options: custom multiplier
      },
    },
    {
      id: 3,
      type: "operation",
      name: "log",
      input: "OP.2:$resolve",
      output: "OP.3:$resolve",
      options: {
        label: "multiplied value is:", // Example options: custom label for logging
      },
    },
    // ... other components
  ],
};

// Load the Schema to create the Process
const process = app.loadSchema(schema);

// Provide a list of DataEntities
process([10, 20, 30, 40, 50, 60]);


```

___

## Mergers

Mergers are components in StreamWise that allow you to combine two or more channels into a single channel. They provide the capability to aggregate and consolidate data entities from multiple sources into one unified channel.

### Schema

The Merger component follows the JSON schema defined as `MergerSchema`. Here are the properties used to configure a Merger:

*   `id` (number|string, required): A unique identifier for the Merger component.
*   `type` (string, const: "merger", required): Specifies the component type as "merger."
*   `name` (string, required): A descriptive name for the Merger component.
*   `inputs` (string[], required): An array of input channels to merge into a single channel.
*   `output` (string, required): The channel where merged data entities will be sent.

### Example

```javascript
import { StreamWise } from "@streamwise/core";

const app = new StreamWise({
  // Redis configuration
});

// Define custom Mergers
app.merger('mergeTwo', {
  inputs: ["FL.1:$resolve", "FL.2:$resolve"],
  output: "MRG.1:$resolve",
});

app.merger('mergeThree', {
  inputs: ["OP.1:$resolve", "OP.2:$resolve", "OP.3:$resolve"],
  output: "MRG.2:$resolve",
});

// Define a Schema for the Process
const schema = {
  id: 1,
  name: "DataProcessingPipeline",
  type: "process",
  inbound: "PRC.1:$inbound",
  outbound: "PRC.1:$outbound",
  components: [
    {
      id: 2,
      type: "merger",
      name: "mergeTwo",
      inputs: ["OP.1:$resolve", "OP.2:$resolve"],
      output: "MRG.1:$resolve",
    },
    {
      id: 3,
      type: "merger",
      name: "mergeThree",
      inputs: ["OP.3:$resolve", "OP.4:$resolve", "OP.5:$resolve"],
      output: "MRG.2:$resolve",
    },
    // ... other components
  ],
};

// Load the Schema to create the Process
const process = app.loadSchema(schema);

// Provide a list of DataEntities
process([10, 20, 30, 40, 50, 60]);
```

In this example, two custom Mergers are defined: "`mergeTwo`" and "`mergeThree`". "`mergeTwo`" combines the data entities from two input channels "`OP.1:$resolve`" and "`OP.2:$resolve`" into a single channel "`MRG.1:$resolve`". Similarly, "`mergeThree`" combines the data entities from three input channels "`OP.3:$resolve`", "`OP.4:$resolve`", and "`OP.5:$resolve`" into a single channel "`MRG.2:$resolve`". By using Mergers, you can effectively consolidate data from multiple sources and streamline data processing within your StreamWise data pipeline.

___

## Channels Naming Convention
In StreamWise, channels play a crucial role in data flow between different components in a pipeline. To ensure a consistent and structured naming scheme, we use the following conventions:

### Component Types and Keys
Each component type is represented by a unique key:
- Filter: Key `FL`
- Operation: Key `OP`
- Merger: Key `MRG`
- Process: Key `PRC`

### Channel Naming Format

To create meaningful and identifiable channel names, we follow the format:
```
KEY.ID:$EVENT
```
Where:

- **KEY**: The component key, representing the type of component (e.g., FL, OP, MRG, PRC).
- **ID**: A unique identifier for the component. This ID allows you to differentiate between channels of the same type.
- **$EVENT**: The event associated with the channel. For example, a Filter can have two events: **$resolve** and **$reject**, while an Operation typically has only **$resolve**.

### Examples
- Filter Channel: `FL.1:$resolve`
  - This represents the output channel of the Filter with ID 1 when data passes the filter (event $resolve).
- Filter Channel: `FL.1:$reject`
  - This represents the output channel of the Filter with ID 2 when data does not meet the criteria (event $reject).
- Operation Channel: `OP.1:$resolve`
  - This represents the output channel of the Operation with ID 1, which successfully processed the data (event $resolve).
- Merger Channel: `MRG.1:$resolve`
  - This represents the output channel of the Merger with ID 1, which combines and redirects data to the next component (event $resolve).
- Process Channel: `PRC.1:$inbound`
  - This represents the input channel of the Process with ID 1, where data enters the pipeline.
- Process Channel: `PRC.1:$outbound`
  - This represents the output channel of the Process with ID 1, where data exits the pipeline.




