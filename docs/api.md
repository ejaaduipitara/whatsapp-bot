#### Webhook for WhatsApp service provider

<details>
 <summary><code>POST</code> <code><b>/webhook</b></code> <code>Webhook enpoint for whatsapp service provider</code></summary>

##### Parameters

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | None      |  required | object (JSON or YAML)   | N/A  |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `201`         | `text/json;charset=UTF-8`        | `Configuration created successfully`                                |
> | `400`         | `application/json`                | `{"code":"400","message":"Bad Request"}`                            |
> | `405`         | `text/html;charset=utf-8`         | None                                                                |

##### Example cURL

> ```javascript
>  curl --location 'localhost:3010/webhook' \--header 'Content-Type: application/json' \--data '{"text":"Hi"}'
> ```

</details>

#### Gupshup - Webhook for WhatsApp service provider

<details>
 <summary><code>POST</code> <code><b>/gupshup/webhook</b></code> <code>Webhook enpoint specific to Gupshup whatsapp service provider</code></summary>

##### Parameters

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | None      |  required | object (JSON or YAML)   | N/A  |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `201`         | `text/json;charset=UTF-8`        | `Configuration created successfully`                                |
> | `400`         | `application/json`                | `{"code":"400","message":"Bad Request"}`                            |
> | `405`         | `text/html;charset=utf-8`         | None                                                                |

##### Example cURL

> ```javascript
>  curl --location 'localhost:3010/gupshup/webhook' \--header 'Content-Type: application/json' \--data '{"text":"Hi"}'
> ```

</details>

------------------------------------------------------------------------------------------

#### Application test

<details>
 <summary><code>GET</code> <code><b>/health</b></code> <code>To test application health/running </code></summary>

##### Parameters

> None

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `text/plain;charset=UTF-8`        | YAML string                                                         |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" http://localhost:3010/health
> ```

</details>  

