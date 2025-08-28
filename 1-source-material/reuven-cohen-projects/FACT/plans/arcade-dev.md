[![Easy to use Python library for creating 2D arcade games. - Best ...](https://tse4.mm.bing.net/th?id=OIP.maMh5BhNOZBG6GQx4RR-PQHaDt\&pid=Api)](https://pybuddy.com/repo/pythonarcadearcade/)

To integrate the Arcade.dev API into your Python projects, you can utilize the `arcadepy` client library. Below is a comprehensive guide to help you get started.

---

## 🔧 Installation

First, install the `arcadepy` package using pip:

```bash
pip install arcadepy
```



---

## 🔐 Authentication

Obtain your API key from [Arcade.dev](https://docs.arcade.dev/home/quickstart) and set it as an environment variable to keep it secure:([Arcade Docs][1])

```bash
export ARCADE_API_KEY="your_api_key_here"
```



Alternatively, you can pass it directly when initializing the client:

```python
from arcadepy import Arcade

client = Arcade(api_key="your_api_key_here")
```



---

## 🚀 Basic Usage

### 1. Execute a Tool

To execute a tool, use the `tools.execute` method. For example, to calculate the square root of 625:([Arcade Docs][1])

```python
from arcadepy import Arcade

client = Arcade()
user_id = "user@example.com"

response = client.tools.execute(
    tool_name="Math.Sqrt",
    input={"a": "625"},
    user_id=user_id,
)

print(f"The square root of 625 is {response.output.value}")
```



### 2. Authorize and Execute a Tool Requiring Authentication

For tools that require user authorization, such as starring a GitHub repository:([Arcade Docs][1])

```python
auth_response = client.tools.authorize(
    tool_name="GitHub.SetStarred",
    user_id=user_id,
)

if auth_response.status != "completed":
    print(f"Please authorize the application by visiting: {auth_response.url}")
    client.auth.wait_for_completion(auth_response.id)

response = client.tools.execute(
    tool_name="GitHub.SetStarred",
    input={
        "owner": "ArcadeAI",
        "name": "arcade-ai",
        "starred": True,
    },
    user_id=user_id,
)

print(response.output.value)
```



---

## 🔄 Asynchronous Usage

For asynchronous operations, use the `AsyncArcade` client:([GitHub][2])

```python
import asyncio
from arcadepy import AsyncArcade

async def main():
    client = AsyncArcade()
    user_id = "user@example.com"

    response = await client.tools.execute(
        tool_name="Math.Sqrt",
        input={"a": "625"},
        user_id=user_id,
    )

    print(f"The square root of 625 is {response.output.value}")

asyncio.run(main())
```



---

## 📚 Additional Resources

* **Official Documentation**: [Arcade.dev Quickstart Guide](https://docs.arcade.dev/home/quickstart)
* **GitHub Repository**: [ArcadeAI/arcade-py](https://github.com/ArcadeAI/arcade-py)([Arcade Docs][1], [GitHub][2])

---

This implementation provides a robust foundation for integrating Arcade.dev's capabilities into your Python applications. If you need further assistance or examples tailored to specific use cases, feel free to ask!

[1]: https://docs.arcade.dev/home/quickstart?utm_source=chatgpt.com "Arcade Quickstart"
[2]: https://github.com/ArcadeAI/arcade-py?utm_source=chatgpt.com "ArcadeAI/arcade-py: Arcade AI Python Client - GitHub"
