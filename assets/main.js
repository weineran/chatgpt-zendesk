(function () {
  var client = ZAFClient.init();

  client.metadata().then(function (metadata) {
    console.log(
      `metadata: ${JSON.stringify(metadata, null, 2)}`
    );
    console.log(
      `metadata.settings.OPENAI_API_KEY: ${JSON.stringify(metadata.settings.OPENAI_API_KEY, null, 2)}`
    );
  });

  client.invoke("resize", { width: "100%", height: "250px" });

  client.get("ticket.comment").then(function (data) {
    // TODO: If there is already a draft, ask the user if they want to replace it.
  }); // This returns the response draft, or empty if no draft

  const generateResponseButton = document.getElementById(
    "generateResponseButton"
  );

  // generateResponseButton.onclick = generateResponse(client);
  generateResponseButton.addEventListener(
    "click",
    function (event) {
      console.log("BUTTON CLICKED!");
      generateResponse(client);
    },
    false
  );
})();

function estimateNumTokens(input) {
  // TODO
}

function generateResponse(client) {
  

  client.get("ticket.conversation").then(function (data) {
    if (data["ticket.conversation"].length > 0) {
      const lastMessage = data["ticket.conversation"][0].message.content;

      client.metadata().then(function (metadata) {
        const emailTone = metadata.settings.Describe_Your_Company_Tone;
        const toneSnippet = `Respond to the email below in a tone that is ${emailTone}.`
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

        console.log(
          `Making request with options [${JSON.stringify(options)}].`
        );

        client.request(options).then(
          function (data) {
            // showInfo(data);

            console.log(
              `Received response with [${data.choices.length}] choices, first choice text [${data.choices[0].text}] and finish_reason [${data.choices[0].finish_reason}].`
            );
            console.log(
              `Used [${data.usage.prompt_tokens}] prompt_tokens, [${data.usage.completion_tokens}] completion_tokens, and [${data.usage.total_tokens}] total_tokens.`
            );

            client
              .set(
                "ticket.comment.text",
                `${data.choices[0].text.trim().replaceAll("\n", "</br>")}`
              )
              .then(function (data) {
                console.log(
                  `ticket.comment.text is now set to: ${JSON.stringify(
                    data,
                    null,
                    2
                  )}`
                );
              });
          },
          function (response) {
            // showError(response);
            console.error(JSON.stringify(response, null, 2));
          }
        );
      });
    }
  });
}

function showInfo(data) {
  var requester_data = {
    name: data.user.name,
    tags: data.user.tags,
    created_at: formatDate(data.user.created_at),
    last_login_at: formatDate(data.user.last_login_at),
  };

  var source = document.getElementById("requester-template").innerHTML;
  var template = Handlebars.compile(source);
  var html = template(requester_data);
  document.getElementById("content").innerHTML = html;
}

function showError(response) {
  var error_data = {
    status: response.status,
    statusText: response.statusText,
  };

  var source = document.getElementById("error-template").innerHTML;
  var template = Handlebars.compile(source);
  var html = template(error_data);
  document.getElementById("content").innerHTML = html;
}

function requestUserInfo(client, id) {
  var settings = {
    url: "/api/v2/users/" + id + ".json",
    type: "GET",
    dataType: "json",
  };

  client.request(settings).then(
    function (data) {
      showInfo(data);
    },
    function (response) {
      showError(response);
    }
  );
}

function formatDate(date) {
  var cdate = new Date(date);
  var options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  date = cdate.toLocaleDateString("en-us", options);
  return date;
}
