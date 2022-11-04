# LeanKit Github Actions
These Github Actions provide an easy way to interact with your LeanKit account during your build or deployment lifecycle. For more information on using Github Actions in general, see https://docs.github.com/en/actions.

To consume, reference this repository, and the action. All available LeanKit Actions are in this repository only. For example: `use: leankit/github-actions/blockCard@v1.1`. See specific examples with input parameters below.

## Usage Notes

### API Tokens
All LeanKit Actions require an "API Token". This token is created in your LeanKit app. In the app, click on your user avatar, then select "API Tokens" and follow prompts to create and copy your token. **Keep this token secure!** This api token can be used to access anything in LeanKit to which you have access, and perform actions in your name. Do not store the token in a workflow file directly -- create a 'secret' and store it in the protected secret file. See https://docs.github.com/en/actions/security-guides/encrypted-secrets for specific instructions on creating and using secrets. Consider creating a "service account" in LeanKit with access limited to only the boards necessary to perform the required actions.

### Error Messages
When any of these actions fail, an error message will be set on the action's output 'error' property. For example, if a 'validateCustomFields' step whose id was 'validation', you could access the error message in a subsequent step (that included the `if: failed()` qualifier) using `${{ steps.validation.outputs.error }}`. We also set an environment variable when one of these actions fails, so the same error would be available at `${{ env.LK_ERROR_MESSAGE }}`.

### Using with LeanKit Card Automation
LeanKit includes automation tools that can trigger a Github Workflow using a `repository_dispatch`. When triggering a workflow, we provide the following as the `client_payload`:
```json
{
  "automation": {
    "description": "github action trigger",
    "id": "10135458880"
  },
  "card": {
    "customFields": [
      {
        "fieldId": "1015460509",
        "label": "Owner",
        "type": "text",
        "value": "bsmith"
      },
      {
        "fieldId": "1015460511",
        "label": "Repository",
        "type": "text",
        "value": "my-github-repo"
      }
    ],
    "customFieldsByLabel": {
      "Owner": "bsmith",
      "Repository": "my-github-repo"
    },
    "externalCardId": null,
    "externalLink": {
      "label": "External System",
      "url": ""
    },
    "id": "1015458334",
    "laneId": "1015460659",
    "title": "Myco fizbrilator cleanser step",
    "url": "https://myco.leankit.com/card/1015458334"
  },
  "event": "movedTo",
  "eventData": {
    "movedFromLaneId": "1015460667"
  },
  "eventDate": "2022-09-13T12:52:37.160Z",
  "host": "https://myco.leankit.com"
}
```
You can access any of these properties using the `github.event.client_payload` object. For example, you might populate a blockCard step's host property using `${{ github.event.client_payload.host }}`.
## Actions Reference
-----------
### Add Comment
Add a comment to a card
#### Input Params
|name|description|required|
|----|-----------|--------|
|host|LeanKit Url (https://mycompany.leankit.com)|yes|
|apiToken|API token with read access to your LeanKit board|yes|
|cardId|Id of the card|yes|
|comment|Comment text|yes|

#### Example workflow step
```
- name: add comment to card
  uses: leankit/github-actions/addComment@v1.1
  with:
    host: https://YOUR-ACCOUNT.leankit.com/
    apiToken: ${{ secrets.MY_API_TOKEN }}
    cardId: 12345
    comment: Hello there card you look great!
```
#### Outputs
* error; error message if failed

-----------
### Block Card
Block or unblock a card
#### Input Params
|name|description|required|
|----|-----------|--------|
|host|LeanKit Url (https://mycompany.leankit.com)|yes|
|apiToken|API token with read access to your LeanKit board|yes|
|cardId|Id of the card|yes|
|isBlocked|Whether to block or unblock the card|yes|
|blockReason|Block reason||

#### Example workflow step
```
- name: block card
  uses: leankit/github-actions/blockCard@v1.1
  with:
    host: https://YOUR-ACCOUNT.leankit.com/
    apiToken: ${{ secrets.MY_API_TOKEN }}
    cardId: 19294230423
    isBlocked: true
    blockReason: Blocked by github action

```
#### Outputs
* error; error message if failed
-----------
### Create Card
Create a new card
#### Input Params
|name|description|required|
|----|-----------|--------|
|host|LeanKit Url (https://mycompany.leankit.com)|yes|
|apiToken|API token with write access to your LeanKit board|yes|
|boardId|Board Id for the new card|yes|
|title|Title of the new card|yes|
|laneId|Optionally specify lane id for the new card. Default drop lane will be used when not set.||
|typeId|Optionally specify a card type id to use. Default card type will be used when not set.||

#### Example workflow step
```
- name: create card
  uses: leankit/github-actions/createCard@v1.1
  with:
    host: https://YOUR-ACCOUNT.leankit.com/
    apiToken: ${{ secrets.MY_API_TOKEN }}
    boardId: 42304923
    title: My Card Title
```
#### Outputs
* error; error message if failed
* createdCardId; newly created card id
-----------
### Move Card
#### Input Params
|name|description|required|
|----|-----------|--------|
|host|LeanKit Url (https://mycompany.leankit.com)|yes|
|apiToken|API token for your LeanKit board|yes|
|cardId|Id of the card|yes|
|laneId|Lane to move the card to|yes|
|wipOverrideComment|WIP Override reason to provide, in case lane is at WIP||
#### Example workflow step
```
- name: move card
  uses: leankit/github-actions/moveCard@v1.1
  with:
    host: https://YOUR-ACCOUNT.leankit.com/
    apiToken: ${{ secrets.MY_API_TOKEN }}
    cardId: 123202023
    laneId: 843923341
```
#### Outputs
* error; error message if failed
-----------
### Assign User
#### Input Params
|name|description|required|
|----|-----------|--------|
|host|LeanKit Url (https://mycompany.leankit.com)|yes|
|apiToken|API token for your LeanKit board|yes|
|cardIds|Comma-separated list of cardIds to update|yes|
|assignUserIds|Comma-separated list of userIds to that will be assigned to the cards||
|unassignUserIds|Comma-separated list of userIds to that will be unassigned from the cards||
|wipOverrideComment|WIP Override reason to provide, in case user is at WIP||

Although they are not technically required, you must specify either `assignUserIds` or `unassignUserIds`. Validation will fail if neither is present.

#### Example workflow step
```
- name: assign users to cards
  uses: leankit/github-actions/assignUsers@v1.1
  with:
    host: https://YOUR-ACCOUNT.leankit.com/
    apiToken: ${{ secrets.MY_API_TOKEN }}
    cardIds: 1234,5678
    assignUserIds: 1111,2222
```
#### Outputs
* error; error message if failed
-----------
### Validate Custom Fields
Fail if specified custom fields do not have a value on a particular card
#### Input Params
|name|description|required|
|----|-----------|--------|
|host|LeanKit Url (https://mycompany.leankit.com)|yes|
|apiToken|API token with read access to your LeanKit board|yes|
|cardId|Id of the card|yes|
|requiredCustomFields|The labels or ids of the custom fields to validate|yes|
|customFields|Custom fields values, if available already||

Note: the `customFields` input is available to receive custom field information that was either provided in a previous step or received from the event payload. The example below demonstrates how customFields may be set if your workflow was started from a LeanKit 'Trigger Github Action` integration step.
#### Example workflow step
```
- name: validate required fields
  uses: leankit/github-actions/validateCustomFields@v1.1
  with:
    host: https://YOUR-ACCOUNT.leankit.com/
    apiToken: ${{ secrets.MY_API_TOKEN }}
    cardId: 12934234
    requiredCustomFields: Age, User Group, 4923403
    customFields: ${{ toJSON(github.event.client_payload.card.customFields) }}
```
#### Outputs
* error; error message if failed
* customFieldsByLabel; custom field values indexed by label
* customFieldsById; custom field values indexed by id

## Dev notes
### Running Build on Windows
As a suggestion, use VS Code as the main tool. It seems to do it right. Two things you should set:
#### The default terminal for VS Code
Change the default terminal to a locally installed bash, e.g. Git Bash (available after you install Git for Windows)
#### The default terminal for npm.
Npm has its own way of doing things, so you want to use:
```
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

### Integration tests
We can use "act" to test actions locally before deploying. See https://github.com/nektos/act for installation instructions.

\> `brew install act` and then `npm run act` to run tests.

Before you run the `act` tests, you'll need to create a `test_payload.json` file at the top level, and populate it as below, but with valid values for your test environment.

```json
{
    "client_payload": {
        "common": {
            "host": "https://YOURHOST.localkanban.com",
            "apiToken": "YOUR_API_TOKEN"
        },
        "addComment": {
            "cardId": "10114257503",
            "comment": "custom fields lookin' good!"
        },
        "createCard": {
            "boardId": "10114176058",
            "title": "github actions test card",
            "laneId": "10114176089",
            "typeId": "10114176061"
        },
        "moveCard": {
            "laneId": "10114176085"
        },
        "blockCard": {
            "isBlocked": true,
            "blockReason": "just because"
        },
        "validateCustomFields": {
            "cardId": "10114257503",
            "requiredCustomFields": "github owner, github repository"
        }
    }
}
```
