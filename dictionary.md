# Programming Dictionary
*A beginner-friendly glossary of programming terms discovered during the learning journey*

**Last Updated:** August 7, 2025  
**Source:** Real code analysis from Anthropic Cookbook and other projects

---

## 🔤 **VARIABLES & DATA**

### Variable
**What it is:** A named container that stores information  
**Real-world analogy:** Like a labeled box where you put things  
**Example:** `client = Anthropic(...)` - the box is named "client" and contains an Anthropic connection  
**When you see it:** Usually `name = something`

### Argument (arg)
**What it is:** Information you pass INTO a function when you use it  
**Real-world analogy:** Like ingredients you give to a chef when ordering  
**Example:** In `llm_call("Hello Claude")`, the text "Hello Claude" is the argument  
**When you see it:** Inside the parentheses when calling a function

### Parameter
**What it is:** The name a function uses to receive arguments  
**Real-world analogy:** Like the chef's recipe that says "ingredient #1"  
**Example:** In `def llm_call(prompt: str)`, `prompt` is the parameter  
**Difference from argument:** Parameter is the name in the function definition, argument is the actual value you pass in

### String (str)
**What it is:** Text data enclosed in quotes  
**Real-world analogy:** Like writing on paper  
**Example:** `"Hello Claude"` or `'This is text'`  
**When you see it:** Anything in quotes

---

## 🔧 **FUNCTIONS & CODE ORGANIZATION**

### Function
**What it is:** A reusable block of code that does a specific task  
**Real-world analogy:** Like a recipe - you write it once, use it many times  
**Example:** `def llm_call(...)` - creates a function to talk to Claude  
**When you see it:** Starts with `def function_name():`

### Import
**What it is:** Bringing external tools/libraries into your code  
**Real-world analogy:** Like getting tools from a toolbox before starting work  
**Example:** `from anthropic import Anthropic` - gets Anthropic's tools  
**When you see it:** Usually at the top of files, starts with `import` or `from`

### Library/Module/Package
**What it is:** Pre-written code that provides useful functions  
**Real-world analogy:** Like a specialized toolkit (e.g., carpenter's toolkit, electrician's toolkit)  
**Example:** `anthropic` is a library for working with Claude  
**When you see it:** After `import` statements

### Return
**What it is:** What a function gives back when it's finished  
**Real-world analogy:** Like getting your order from a restaurant after they cook it  
**Example:** `return response.content[0].text` - gives back Claude's answer  
**When you see it:** Usually at the end of functions, starts with `return`

---

## 🌐 **API & INTEGRATION CONCEPTS**

### API (Application Programming Interface)
**What it is:** A way for different programs to talk to each other  
**Real-world analogy:** Like a waiter who takes your order to the kitchen and brings back food  
**Example:** Anthropic API lets your code send questions to Claude  
**When you see it:** Usually in context of external services

### API Key
**What it is:** A password that proves you're allowed to use an API  
**Real-world analogy:** Like a membership card to enter a club  
**Example:** `ANTHROPIC_API_KEY` proves you can use Claude  
**When you see it:** Often stored in environment variables for security

### Environment Variable
**What it is:** A secure way to store sensitive information outside your code  
**Real-world analogy:** Like keeping your wallet separate from your notebook  
**Example:** `os.environ["ANTHROPIC_API_KEY"]` gets the API key safely  
**When you see it:** `os.environ["VARIABLE_NAME"]`

---

## 📊 **DATA STRUCTURES**

### List
**What it is:** An ordered collection of items  
**Real-world analogy:** Like a shopping list or to-do list  
**Example:** `[{"role": "user", "content": prompt}]` - a list with one message  
**When you see it:** Enclosed in square brackets `[item1, item2, item3]`

### Dictionary (dict)
**What it is:** A collection of key-value pairs  
**Real-world analogy:** Like a phone book - you look up a name (key) to find a number (value)  
**Example:** `{"role": "user", "content": prompt}` - "role" is key, "user" is value  
**When you see it:** Enclosed in curly braces `{key: value, key2: value2}`

---

## 🛠️ **DEVELOPMENT TOOLS**

### Repository (repo)
**What it is:** A folder containing all files for a project, with version history  
**Real-world analogy:** Like a project binder with all documents and revision history  
**Example:** The Anthropic Cookbook repository we're analyzing  
**When you see it:** On GitHub, or when using Git commands

### Clone
**What it is:** Making a copy of a repository on your local machine  
**Real-world analogy:** Like photocopying all pages of a project binder  
**Example:** `git clone https://github.com/...` - copy the project locally  
**When you see it:** Git command to download repositories

### Commit
**What it is:** A saved snapshot of your code changes  
**Real-world analogy:** Like taking a photo of your work progress  
**Example:** "Initial commit: Learning Software Development Lab setup"  
**When you see it:** Git version control, represents a point in project history

---

## 💡 **NAMING & CONVENTIONS**

### Camel Case
**What it is:** Naming style where each word after the first is capitalized  
**Example:** `llmCall`, `systemPrompt`, `apiKey`  
**When you see it:** Common in JavaScript, some Python variables

### Snake Case  
**What it is:** Naming style where words are separated by underscores  
**Example:** `llm_call`, `system_prompt`, `api_key`  
**When you see it:** Very common in Python

### Constant
**What it is:** A value that never changes during program execution  
**Real-world analogy:** Like mathematical constants (π = 3.14...)  
**Example:** `MODEL_NAME = "claude-3-5-sonnet-20241022"`  
**When you see it:** Usually ALL_CAPS in many languages

---

## ❓ **TERMS TO EXPLORE LATER**
*Concepts we've encountered but need more context to fully understand*

- **Object** (as in "client is an object")
- **Class** (haven't found one yet in our analysis)
- **Method** vs Function
- **Exception/Error handling**
- **Regex** (re.DOTALL)
- **JSON** format
- **Async/Await**

---

## 📝 **QUICK REFERENCE**

**Variable vs Argument vs Parameter:**
- **Variable:** `name = value` (storage container)
- **Parameter:** `def function(parameter_name):` (placeholder in function definition)  
- **Argument:** `function(actual_value)` (real value passed to function)

**Import vs From:**
- **import os:** Gets the whole os toolkit, use as `os.environ`
- **from os import environ:** Gets just the environ tool, use as `environ`

---

*This dictionary grows with each project we analyze. New terms discovered are added immediately for future reference.*