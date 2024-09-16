document.addEventListener('DOMContentLoaded', () => {
    // Function to handle converting the request details to Python requests code
    function convertToPythonRequests(url, method, headers, postData) {
      let pythonCode = `import requests\n\n`;
      pythonCode += `url = "${url}"\n`;
      pythonCode += `headers = {\n`;
  
      headers.forEach(header => {
        pythonCode += `    "${header.name}": "${header.value}",\n`;
      });
  
      pythonCode += `}\n\n`;
      if (method === "GET") {
        pythonCode += `response = requests.get(url, headers=headers)\n`;
      } else if (method === "POST") {
        pythonCode += `data = ${postData}\n`;
        pythonCode += `response = requests.post(url, headers=headers, data=data)\n`;
      }
  
      pythonCode += `\nprint(response.text)\n`;
      return pythonCode;
    }
  
    // Add an event listener to the convert button
    document.getElementById("convertBtn").addEventListener("click", () => {
      // Example of generating Python requests code (you'll need to fetch the request details)
      const pythonCode = convertToPythonRequests('http://example.com', 'GET', [], '');
      navigator.clipboard.writeText(pythonCode).then(() => {
        alert("Python code copied to clipboard!");
      });
    });
  });