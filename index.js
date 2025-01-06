const axios = require("axios");

const models = {
  text: ["chatgpt","llama","searchgpt","deepseek","claude"],
  image: ["flux","flux-realism","flux-cablyai","flux-anime","flux-3d","any-dark","flux-pro","turbo"]
}

async function Text(model) {
  if (!model) {
    throw new Error("No model specified")
  } else if (!models.text.includes(model.toLowerCase())) {
    throw new Error("Invalid model specified")
  } 
  
  const parent = this;
  
  this.messages = []
  this.ask = async function(arg1) {
    let content, role;
    
    if (typeof arg1 === "string") {
      content = arg1
      role = "user"
    } else if (typeof arg1 === "object") {
      ({ role, content } = arg1)
    }
    
    parent.messages.push({ role, content });
    
    if (role === "user") {
      const { data } = await axios.post("https://text.pollinations.ai/", {
        messages: parent.messages,
        model,
      });
    
      parent.messages.push({ role: "assistant", content: data });
    }
  }
  
  return this;
}

async function Image(arg1, arg2) {
  let input;
  
  if (typeof arg1 === "string") {
    input = arg2
    input.prompt = arg1
  } else if (typeof arg1 === "object") {
    input = arg1
  }
  
  if (!input.prompt) {
    throw new Error("No prompt provided")
  } else if (!input.model) {
    throw new Error("No model specified")
  } else if (!models.image.includes(input.model.toLowerCase())) {
    throw new Error("Invalid model specified")
  } else if (input.dimensions && !/[0-9]+x[0-9]+/.test(input.dimensions)) {
    throw new Error("Invalid dimensions format")
  } else if (input.dimensions && (input.width && input.height)) {
    throw new Error("Dimensions and height and width both have a value")
  }
  
  if (!input.seed) {
    input.seed = getRandomSeed();
  } 
  if (input.nologo === undefined) {
    input.nologo = false;
  }
  if (!input.private) {
    input.privated = false;
  }
  if (input.private === true) {
    input.privated = true;
  }
  if (input.enhanced === undefined) {
    input.enhanced = null;
  }
  if (input.safe === undefined) {
    input.safe = true;
  }
  if (!input.dimensions && (!input.width && !input.height)) {
    input.dimensions = "1080x1080";
  }
  if (input.width && input.height) {
    input.dimensions = input.width + "x" + input.height
  }
  
  const [ width, height ] = input.dimensions.split("x");
  const { prompt, model, seed, nologo, privated, enhanced, safe } = input;
  
  const { data } = await axios("https://image.pollinations.ai/prompt/" + prompt + "?" + objectToURLParams({
    model,
    seed,
    width,
    height,
    nologo,
    private: privated,
    enhanced,
    safe
  }),
  { 
    responseType: "arraybuffer" 
  });
  
  return data;
}

function objectToURLParams(obj) {
  const params = new URLSearchParams();

  for (const key in obj) {
    params.append(key, obj[key]);
  }

  return params.toString();
}

function getRandomSeed() {
  return Math.floor(Math.random() * (2 ** 32)); // Range: 0 to 4,294,967,295
}

module.exports = { Text, Image };
