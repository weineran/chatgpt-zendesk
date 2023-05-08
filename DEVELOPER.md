# How to develop

## Pre-requisites
* Ensure you have **ZCLI** installed as described here: https://developer.zendesk.com/documentation/apps/build-an-app/build-your-first-support-app/part-1-laying-the-groundwork/

## Test locally
* ⚠️ This app utilizes "secure settings" (`OPENAI_API_KEY`) and therefore cannot currently be fully tested locally using `zcli apps:server`
    * Background: https://developer.zendesk.com/documentation/apps/build-an-app/build-your-first-support-app/part-2-designing-the-user-interface/
    * Secure setting limitations: https://developer.zendesk.com/documentation/apps/app-developer-guide/making-api-requests-from-a-zendesk-app/#secure-setting-limitations
* In particular, API calls to OpenAI will not work.
* Most/all other aspects of the app can be tested locally. See here: https://developer.zendesk.com/documentation/apps/build-an-app/build-your-first-support-app/part-2-designing-the-user-interface/#testing-the-app

## Test as private Zendesk app
Since this app can't be fully tested locally, you'll have to upload the app to your Zendesk developer account.

### First Time: Install
* See here: https://developer.zendesk.com/documentation/apps/getting-started/using-zcli/#packaging-and-installing-a-private-zendesk-app
* TLDR: 
```
zcli apps:create {app_directory}
```

### Every other time: Update
* See here: https://developer.zendesk.com/documentation/apps/getting-started/using-zcli/#updating-a-private-zendesk-app
* TLDR:
```
zcli apps:update {app_directory}
```