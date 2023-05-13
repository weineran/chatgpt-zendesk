// Copyright Andrew Weiner 2023 All Rights Reserved

(function () {
  var logLevel = "WARN"

  setLogLevel(logLevel, console);

  var client = ZAFClient.init();

  client.invoke("resize", { width: "100%", height: "350px" });

  const resetToneButton = document.getElementById("resetToneButton");
  resetToneButton.addEventListener(
    "click",
    function (event) {
      resetTone(client);
    },
    useCapture = false
  );

  resetTone(client); // Initially, use the default tone

  const generateResponseButton = document.getElementById(
    "generateResponseButton"
  );
  generateResponseButton.addEventListener(
    "click",
    function (event) {
      generateResponse(client);
    },
    useCapture = false
  );
})();

function setLogLevel(logLevel, console) {
  switch(logLevel) {
    case "SILENT":
      console.error = function(){};
      // intentional fall through
    case "ERROR":
      console.warn = function(){};
      // intentional fall through
    case "WARN":
      console.info = function(){};
      // intentional fall through
    case "INFO":
      console.debug = function(){};
      // intentional fall through
    case "DEBUG":
      // do nothing
      break;
    default:
      console.error(`logLevel [${logLevel}] must be one of ["SILENT", "ERROR", "WARN", "INFO", "DEBUG"]`);
  }
}

function resetTone(client) {
  client.metadata().then(function (metadata){
    document.getElementById("promptTone").value = metadata.settings.Describe_Your_Company_Tone;
  });
}

function estimateNumTokens(input) {
  // TODO(AW)
}

function generateResponse(client) {
  // TODO(AW): If there is already a draft, ask the user if they want to replace it.
  client.get("ticket.comment").then(function (data) {
    // This returns the response draft, or empty if no draft
  }); 

  client.get("ticket.conversation").then(function (data) {
    if (data["ticket.conversation"].length > 0) {
      const lastMessage = data["ticket.conversation"][0].message.content;

      client.metadata().then(function (metadata) {
        const emailTone = document.getElementById("promptTone").value;
        const toneSnippet = `Respond to the email below in a tone that is ${emailTone}.`;
        const promptPrefix = document.getElementById("promptPrefix").value;

        const prompt = `${toneSnippet} ${promptPrefix}: ${lastMessage}`;

        const numPromptTokens = estimateNumTokens(prompt);
        const MODEL_MAX_CONTENT_LENGTH = 4097; // num tokens

        const options = {
          url: "https://api.openai.com/v1/completions",
          type: "POST",
          contentType: "application/json",
          headers: {
            Authorization: `Bearer {{setting.OPENAI_API_KEY}}`,
          },
          secure: true,
          data: JSON.stringify({
            // https://beta.openai.com/docs/api-reference/completions
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0.2, // Between 0 and 1. Higher means the model will take more risks.
            max_tokens: 3000,
          }),
        };

        console.debug(
          `Making request with options [${JSON.stringify(options)}].`
        );

        client.request(options).then(
          function (data) {
            console.debug(
              `Received response with [${data.choices.length}] choices, first choice text [${data.choices[0].text}] and finish_reason [${data.choices[0].finish_reason}].`
            );
            console.debug(
              `Used [${data.usage.prompt_tokens}] prompt_tokens, [${data.usage.completion_tokens}] completion_tokens, and [${data.usage.total_tokens}] total_tokens.`
            );

            client
              .set(
                "ticket.comment.text",
                `${data.choices[0].text.trim().replaceAll("\n", "</br>")}`
              )
              .then(function (data) {
                console.debug(
                  `ticket.comment.text is now set to: ${JSON.stringify(
                    data,
                    null,
                    2
                  )}`
                );
              });
          },
          function (response) {
            console.error(JSON.stringify(response, null, 2));
          }
        );
      });
    }
  });
}
