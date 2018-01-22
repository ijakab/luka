----------
## Response data structure

All responses are sent as **JSON**. <br>
Also, response always contain **data** and **message** key. <br>
Data is always an **array**, while message is always a **string**.

## Examples:
**Single response:**
```json
{
  "data": [
    {
      "token": "eyJhbGciOinR5cCI6IkpXVCJ9.eyJ1aWiOnsiaXNB",
      "user": {
        "name": "user 1"
      }
    }
  ],
  "message": "ok"
}
```
> **Note:** Even when sending single object as response, data is still an array!

**Empty response:**
```json
{
  "data": [],
  "message": "User not found"
}
```

## Authorization

After login, you will receive JWT token. <br>
JWT token should be sent to **all** protected routes **inside header** field **Authorization** in format: <br>
```json
Bearer token_string_here
```
Token will expire in short period of time (usually 15 minutes). <br>
To get new token, there is a refresh token route where you send your refresh token to get new one
