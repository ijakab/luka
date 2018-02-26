----------
## Response data structure

All responses are sent as **JSON**. <br>
Also, response always contain **data** and **message** key. <br>
There are two options:<br>
**WITH x-is-mobile** header - _data_ is always an **array**, while message is always a **string**.<br>
**WITHOUT x-is-mobile** header - _data_ is **array** or **object**, while message is always a **string**.

### x-is-mobile header
Set it to `android` or `ios` if you want to wrap all responses to data array

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
> **Note:** Even when sending single object as response, data is still an array!

**Same response with x-is-mobile header**
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

**Empty response:**
```json
{
  "data": {},
  "message": "User not found"
}
```

**Empty response with x-is-mobile header:**
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
