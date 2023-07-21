# StreamWise
StreamWise Core is a powerful and flexible pipeline library for data processing. It allows you to effortlessly build data pipelines that can handle any type of data, from simple numbers and strings to complex data structures.

## Features
- *Modular Components*: StreamWise provides a variety of components such as filters, operations, and mergers, allowing you to create custom pipelines tailored to your specific data processing needs.

- *JSON Representation*: Define your data processing pipeline using a JSON representation that provides a clear and concise way to specify the components, their interconnections, and the overall flow of data.

- *Versatility*: StreamWise is designed to be highly versatile, capable of processing diverse data types and handling complex data transformation tasks. 

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

```
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

## Overview of Components:
StreamWise offers three core components for building data processing pipelines:

- *Filters*: Filters evaluate data against user-defined criteria and split it into "resolved" and "rejected" channels based on the evaluation outcome.

- *Operations*: Operations perform custom actions on data received from filters or previous operations, enabling data transformation, logging, and more.

- *Mergers*: Mergers combine multiple channels of data into a single output, allowing seamless integration of different data streams.

These modular components provide the building blocks to construct powerful, flexible, and efficient data processing pipelines tailored to your specific needs.

### Filters
Filters are integral components in StreamWise that enable data evaluation based on user-defined criteria. They process incoming data and categorize it into two channels: "resolved" and "rejected," depending on whether the data meets the filter's criteria.

#### Creating Custom Filters
To create a custom filter, use the `app.filter()` method. Define a filter function that takes the `data`, `criteria`, `resolve` function, and `reject` function as arguments. The filter function evaluates the data against the specified criteria and calls the appropriate function (`resolve` or `reject`) based on the result.

```
app.filter('CustomFilter', (data, criteria, resolve, reject) => {
  if (data > criteria.threshold) {
    resolve(data); // Data passes the filter
  } else {
    reject(data); // Data does not meet the criteria
  }
});
```

#### Adding Filters to the Pipeline
In the pipeline schema, specify filters by their unique names and connect them to other components using the "input" and "output" properties.

```
{
  id: 1,
  type: "filter",
  name: "CustomFilter",
  input: "PRC.1:$dataEntry",
  output: {
    resolve: "FL.1:$resolve",
    reject: "FL.1:$reject"
  },
  criteria: {
    threshold: 50 // Example criteria: filter data greater than 50
  }
}
```

#### Criteria Configuration
Criteria are customizable parameters used by filters to determine data eligibility. In the example above, the filter checks if the data is greater than the specified "threshold" value (in this case, 50). You can define various criteria based on your data and processing needs.

#### Example
Suppose we want to filter out numbers less than 50 and separate them into two channels: "greater" and "lesser." We create a custom filter with a criteria threshold of 50 to achieve this:

```
app.filter('NumberFilter', (data, criteria, resolve, reject) => {
  if (data > criteria.threshold) {
    resolve(data); // Data greater than 50 goes to "greater" channel
  } else {
    reject(data); // Data less than or equal to 50 goes to "lesser" channel
  }
});
```

In the pipeline schema, we connect the "NumberFilter" component to the input and output channels:

```
{
  id: 1,
  type: "filter",
  name: "NumberFilter",
  input: "PRC.1:$dataEntry",
  output: {
    resolve: "FL.1:$greater",
    reject: "FL.1:$lesser"
  },
  criteria: {
    threshold: 50 // Filter criteria to separate numbers greater than 50
  }
}
```

#### Summary
- *Data Segmentation*: Filters split data into "resolved" and "rejected" streams, facilitating targeted data processing.
- *Customizable Criteria*: Create filters with specific criteria, enabling fine-grained control over data filtering.
- *Asynchronous Support*: Filter functions can be asynchronous, allowing asynchronous operations during data evaluation.
- *Modular and Reusable*: Filters are modular components, allowing easy reuse across different pipelines.

With StreamWise Filters, you can efficiently process data based on custom conditions and streamline data flow in your pipelines.
___

### Operations
Operations are essential components in StreamWise that enable custom data processing and transformations. They process data received from filters or previous operations and allow you to perform specific actions based on your application's requirements.

#### Creating Custom Operations
To create a custom operation, use the `app.operation()` method. Define an operation function that takes the `data`, `resolve` function, and optional `options` as arguments. The operation function processes the data as needed and calls the resolve function to pass the processed data to the next component in the pipeline.

```
app.operation('times', async (data, resolve, options) => {
  // Asynchronous data processing logic
  const output = data * (options?.x || 1);
  resolve(output); // Pass processed data to the next component
});
```

#### Adding Operations to the Pipeline
In the pipeline schema, specify operations by their unique names and connect them to other components using the "input" and "output" properties.

```
{
  id: 3,
  type: "operation",
  name: "times",
  input: "FL.1:$resolve",
  output: "OP.3:$resolve",
  options: {
    x: 5 // Example options: custom multiplication factor (default: 1)
  }
}
```

#### Options Configuration
Options allow you to customize the behavior of operations. In the example above, we provide an option "x" to set a custom multiplication factor.

#### Example
Suppose we want to multiply the data received from a filter by a custom factor, which defaults to 1 if not provided. We create a custom operation named "Multiplier" to achieve this:

```
app.operation('Multiplier', async (data, resolve, options) => {
  // Asynchronous data processing logic
  const output = data * (options?.factor || 1);
  resolve(output); // Pass processed data to the next component
});
```
In the pipeline schema, we connect the "Multiplier" component to the input and output channels:

```
{
  id: 3,
  type: "operation",
  name: "Multiplier",
  input: "FL.1:$resolve",
  output: "OP.3:$resolve",
  options: {
    factor: 5 // Custom multiplication factor (default: 1)
  }
}
```

#### Summary

- *Custom Data Processing*: Operations enable you to perform custom data transformations tailored to your application's requirements.
- *Asynchronous Support*: Operation functions can be asynchronous, allowing asynchronous operations during data processing.
- *Modular and Reusable*: Operations are modular components, allowing easy reuse across different pipelines.
With StreamWise Operations, you can seamlessly process and transform data, making it an essential part of your data processing pipeline.
___

### Merger
The Merger component in StreamWise is used to consolidate multiple input channels into a single output channel. It facilitates the redirection and combination of different data streams, simplifying data flow management in your pipeline.

#### Adding Mergers to the Pipeline
In the pipeline schema, you can define a merger using the following format:
```{
  id: 5,
  type: "merger",
  name: "DataMerger",
  inputs: [
    "OP.3:$resolve", // Data from "greater" channel
    "OP.4:$resolve", // Data from "lesser" channel
  ],
  output: "MRG.5:$resolve" // Merged output channel
}
```
In this example, we connect the *"DataMerger"* component to two input channels, which receive data from the *"greater"* and *"lesser"* streams. The merged data is then sent to the *"MRG.5:$resolve"* output channel.

#### Summary
- *Data Stream Consolidation:* Mergers efficiently combine and redirect multiple data streams, simplifying complex data processing tasks.
- *Streamlined Data Flow:* The Merger component ensures a well-organized and structured data flow in your pipeline.
- *Modular and Reusable*: Mergers are modular components, allowing easy reuse across different pipelines.
With StreamWise Mergers, you can seamlessly merge data streams, manage data routing efficiently, and enhance the overall data processing capabilities of your pipeline.
___

### Creating a Process
A Process in StreamWise represents the entire data processing pipeline, consisting of interconnected components such as Filters, Operations, and Mergers. To create a Process, follow these steps:

#### Step 1: Setup StreamWise
Initialize StreamWise by providing the Redis configuration and any custom Filters and Operations you want to use:

```

import { StreamWise } from "@streamwise/core";

const app = new StreamWise({
  host: 'redis-host',
  port: 6379,
  username: 'username',
  password: 'password',
});

// Add custom Filters and Operations (optional)
app.filter('CustomFilter', async (data, criteria, resolve, reject) => {
  // Asynchronous filtering logic
  if (data > criteria.threshold) {
    resolve(data); // Data passes the filter
  } else {
    reject(data); // Data does not meet the criteria
  }
});

app.operation('CustomOperation', async (data, resolve, options) => {
  // Asynchronous data processing logic
  // Example: Logging data with a custom label
  console.log(data, 'is', options?.label);
  resolve(data); // Pass the data further down the pipeline
});

app.operation('Logger', async (data, resolve, options) => {
  // log any data
  console.log(data);
  resolve(data); // Pass the data further down the pipeline
});

```

#### Step 2: Define the Pipeline Schema
Create a JSON representation of the pipeline schema, specifying the components and their connections:

```
const schema = {
  id: 1,
  name: "DataProcessingPipeline",
  type: "process",
  dataEntry: "PRC.1:$dataEntry",
  output: "PRC.1:$resolve",
  components: [
    {
      id: 2,
      type: "filter",
      name: "CustomFilter",
      input: "PRC.1:$dataEntry",
      output: {
        resolve: "FL.2:$resolve",
        reject: "FL.2:$reject",
      },
      criteria: {
        threshold: 50, // Example criteria: filter data greater than 50
      },
    },
    {
      id: 3,
      type: "operation",
      name: "CustomOperation",
      input: "FL.2:$resolve",
      output: "OP.3:$resolve",
      options: {
        label: "greater than 50", // Example options: custom label for logging
      },
    },
    {
      id: 4,
      type: "operation",
      name: "CustomOperation",
      input: "FL.2:$reject",
      output: "OP.4:$resolve",
      options: {
        label: "lesser than 50", // Example options: custom label for logging
      },
    },
    {
      id: 5,
      type: "merger",
      name: "MergeTwoStreams",
      inputs: [
        "OP.3:$resolve",
        "OP.4:$resolve",
      ]
    },
  ],
};
```

#### Step 3: Load the Pipeline Schema
Load the pipeline schema into the app to create the Process:
```
const process = app.loadSchema(schema);
```

#### Step 4: Provide Data to the Process
Finally, provide a list of DataEntities to the Process for data processing:
```
process([10, 20, 30, 40, 50, 60]);
```

### Channel Naming Convention
In StreamWise, channels play a crucial role in data flow between different components in a pipeline. To ensure a consistent and structured naming scheme, we use the following conventions:

#### Component Types and Keys
Each component type is represented by a unique key:
- Filter: Key `FL`
- Operation: Key `OP`
- Merger: Key `MRG`
- Process: Key `PRC`

#### Channel Naming Format

To create meaningful and identifiable channel names, we follow the format:
```
KEY.ID:$EVENT
```
Where:

- *KEY*: The component key, representing the type of component (e.g., FL, OP, MRG, PRC).
- *ID*: A unique identifier for the component. This ID allows you to differentiate between channels of the same type.
- *$EVENT*: The event associated with the channel. For example, a Filter can have two events: *$resolve* and *$reject*, while an Operation typically has only *$resolve*.

#### Examples
- Filter Channel: `FL.1:$resolve`
  - This represents the output channel of the Filter with ID 1 when data passes the filter (event $resolve).
- Filter Channel: `FL.1:$reject`
  - This represents the output channel of the Filter with ID 2 when data does not meet the criteria (event $reject).
- Operation Channel: `OP.1:$resolve`
  - This represents the output channel of the Operation with ID 1, which successfully processed the data (event $resolve).
- Merger Channel: `MRG.1:$resolve`
  - This represents the output channel of the Merger with ID 1, which combines and redirects data to the next component (event $resolve).
- Process Channel: `PRC.1:$dataEntry`
  - This represents the input channel of the Process with ID 1, where data enters the pipeline.





