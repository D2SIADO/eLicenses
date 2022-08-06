# eLicenses

eLicenses is a simple manager of licenses, the api works with Post
methods, there are a aviable lenguages in guide...

- Python

> Note: This are only a examples, are different POST methods...

## Examples
### Python
```python
import httpx

host = 'your host'
licensekey = 'your key license'
product = 'your product name'
version = 'your version product'
authkey = 'your auth key'

r = httpx.post(host, data={
    "keylicense": licensekey,
    "productname": product,
    "version": version
}, headers={
    "Authorization": authkey
})
if r.json()["status_overview"] == 'success':
    print('')
    print('License is valid')
    print(f'Reason: {r.json()["status_msg"]}')
    print(f'Client: {r.json()["discordtag"]}')
    print('')
else:
    print('')
    print('License are invalid')
    print(f'Status Code: {r.status_code}')
    print(f'Reason: {r.json()["status_msg"]}')
    print('')
```