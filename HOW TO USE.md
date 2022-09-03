# eLicenses

eLicenses is a simple manager of licenses, the api works with Post
methods, there are a aviable lenguages in guide...

- Python

> Note: This are only a examples, are different POST methods...

## Examples
### Python
There are the use to the api in python
```python
import httpx

host = 'your host'
licensekey = 'your key license'
product = 'your product name'
version = 'your version product'
authkey = 'your auth key'

r = httpx.post(host, data={
    "licensekey": licensekey,
    "product": product,
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
### Java
There are the using of the api for java
#### How to use the class
```java
if (!License.check(new URI("Your host with port")
    , "the license" // Get on the config.yml or set the string
    , "name of the plugin" // Get on the plugin.yml or set the string
    , "version of the plugin" // Get on the plugin.yml or set the string
    , "your api key")) return; // The api key on your config.json file elicenses
```
#### Maven Plugin
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.2.4</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <relocations>
            <relocation>
                <pattern>org.apache.httpcomponents</pattern>
                <shadedPattern>org.apache.http</shadedPattern>
            </relocation>
        </relocations>
        <createDependencyReducedPom>false</createDependencyReducedPom>
    </configuration>
</plugin>
```
#### Maven Dependencies
```xml
<dependency> <!-- HTTP (Dependencie) -->
    <groupId>org.apache.httpcomponents</groupId>
    <artifactId>httpclient</artifactId>
    <version>4.3.4</version>
</dependency>
<dependency> <!-- JSON (Dependencie) -->
    <groupId>org.json</groupId>
    <artifactId>json</artifactId>
    <version>20210307</version>
</dependency>
<dependency> <!-- Lombok (Dependencie) -->
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.16.6</version>
    <scope>provided</scope>
</dependency>
```
#### Java Class
```java
@RequiredArgsConstructor
@Getter
class License {
    public static boolean check(URI host, String license, String product, String version, String apikey) {
        HttpPost post = new HttpPost(host);
        List<NameValuePair> data = Arrays.asList(new BasicNameValuePair("licensekey", license)
                , new BasicNameValuePair("product", product), new BasicNameValuePair("version", version));
        try {
            post.setEntity(new UrlEncodedFormEntity(data));
        } catch (UnsupportedEncodingException e) {
            return false;
        }
        post.setHeader("Authorization", apikey);
        try (CloseableHttpClient httpClient = HttpClients.createDefault(); CloseableHttpResponse response = httpClient.execute(post)) {
            String info = EntityUtils.toString(response.getEntity());
            JSONObject obj = new JSONObject(info);
            if (!obj.has("status_msg") || !obj.has("status_code")) {
                return false;
            }
            if ((obj.getString("status_overview") == null || !obj.has("status_id") || !obj.has("status_code")) || ((!"success".equals(obj.getString("status_overview"))
            || !"SUCCESS".equals(obj.getString("status_id")) || !(obj.getInt("status_code") == 200)))) {
                return false;
            }
            return true;
        } catch (IOException e) {
            return false;
        }
    }
}
```