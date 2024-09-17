// Function to convert PowerShell command to Python requests code
function convertPowershellToPython(powershellCode) {
    let cookies = {};
    let headers = {};
    let method = 'GET';
    let url = '';
    let body = '';
    let contentType = '';
    let isJson = false;
  
    // Extract the URL
    const urlMatch = powershellCode.match(/-Uri\s+["']([^"']+)["']/i);
    if (urlMatch) {
      url = urlMatch[1];
    }
  
    // Extract the method (GET or POST)
    const methodMatch = powershellCode.match(/-Method\s+(\w+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    }
  
    // Extract cookies
    const cookiesMatches = [...powershellCode.matchAll(/\$session\.Cookies\.Add\(\(New-Object System\.Net\.Cookie\("([^"]+)",\s*"([^"]+)",\s*"([^"]*)",\s*"([^"]*)"\)\)\)/g)];
    cookiesMatches.forEach(match => {
      const [, name, value] = match;
      cookies[name] = value;
    });
  
    // Extract headers
    const headersMatch = powershellCode.match(/-Headers\s+@{([^}]+)}/is);
    if (headersMatch) {
      const headersString = headersMatch[1].trim();
      const headersArray = headersString.split(/\r?\n/).map(header => header.trim().replace(/^"|",$/g, '')); // Split headers properly
  
      headersArray.forEach(header => {
        const [key, value] = header.split(/\s*=\s*/).map(s => s.replace(/^"|",$|'/g, ''));
        if (key && value) headers[key] = value;
  
        // Check for Content-Type to determine if the body is JSON
        if (key.toLowerCase() === 'contenttype') {
          contentType = value.toLowerCase();
          if (contentType.includes('application/json')) {
            isJson = true;
          }
        }
      });
    }
  
    // Extract body (if present)
    const bodyMatch = powershellCode.match(/-Body\s+(`"|')(.+?)(`"|')/is);
    if (bodyMatch) {
      body = bodyMatch[2].replace(/`n/g, '\n').replace(/`"/g, '"').replace(/\\"/g, '"'); // Initial cleanup

      // Advanced JSON parsing and formatting
      try {
        // Evaluate the body as JavaScript code to handle nested backticks and complex structures
        const parsedBody = eval("(" + body + ")"); 
        body = JSON.stringify(parsedBody, null, 2); // Reformat to pretty JSON
        isJson = true;
      } catch (e) {
        console.error("Error parsing JSON body:", e); // Log errors for debugging
        // If not valid JSON, keep as is or attempt further cleanup if needed
        isJson = false;
      }
    }
  
    // Build the Python requests code
    let pythonCode = `import requests\n\n`;
    pythonCode += `session = requests.Session()\n\n`;
  
    // Add cookies to the Python code
    for (const [key, value] of Object.entries(cookies)) {
      pythonCode += `session.cookies.set("${key}", "${value}")\n`;
    }
  
    pythonCode += `\nurl = "${url}"\n`;
    pythonCode += `headers = {\n`;
  
    for (const [key, value] of Object.entries(headers)) {
      pythonCode += `    "${key}": "${value}",\n`;
    }
  
    pythonCode += `}\n\n`;
  
    // Handle the request method and payload
    if (method === "GET") {
      pythonCode += `response = session.get(url, headers=headers)\n`;
    } else if (method === "POST") {
      if (isJson) {
        pythonCode += `json_data = ${body}\n`;
        pythonCode += `response = session.post(url, headers=headers, json=json_data)\n`;
      } else {
        pythonCode += `data = """${body}"""\n`;
        pythonCode += `response = session.post(url, headers=headers, data=data)\n`;
      }
    } else {
      pythonCode += `response = session.request("${method}", url, headers=headers, data=data)\n`;
    }
  
    pythonCode += `\nprint(response.text)\n`;
    return pythonCode;
  }
  
  // Event listener for button click
  document.addEventListener("DOMContentLoaded", function () {
    const convertButton = document.getElementById("convertBtn");
  
    if (convertButton) {
      convertButton.addEventListener("click", () => {
        const powershellInput = document.getElementById("fetchInput").value;
        if (powershellInput) {
          // Convert PowerShell command to Python requests code
          const pythonCode = convertPowershellToPython(powershellInput);
  
          // Display the Python code
          document.getElementById('output').textContent = pythonCode;
  
          // Copy the generated code to clipboard
          navigator.clipboard.writeText(pythonCode).then(() => {
            alert("Python code copied to clipboard!");
          }).catch(err => {
            console.error('Failed to copy text: ', err);
          });
        } else {
          alert("Please paste a PowerShell command first.");
        }
      });
    }
  });