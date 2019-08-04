----------
## Response data structure

All responses are sent as **JSON**. <br>
Also, response always contain **data** and **message** key. <br>
_data_ is **array** or **object**, while message is always a **string**.


## Examples:
**Single response:**
```json
{
  "data": {
      "token": "eyJhbGciOinR5cCI6IkpXVCJ9.eyJ1aWiOnsiaXNB",
      "user": {
        "name": "user 1"
      }
  },
  "message": "ok"
}
```
> **Note:** When response is a list... Data will be array containing objects.

**Empty response:**
```json
{
  "data": {},
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
Server will respond with status 401 (Unauthorized) when this happens. <br>
To get new token, there is a refresh token route where you send your refresh token to get new one
