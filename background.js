// backround.js

chrome.runtime.onConnect.addListener(isMediumArticleMembersOnly);

function isMediumArticleMembersOnly(port) {
  port.onMessage.addListener(function(message) {
    fetch(message.link)
      .then(function(response) {
          // When the page is loaded convert it to text
          return response.text()
      })
      .then(function(htmlText) {
          // Send the response to content.js
          return port.postMessage({htmlContent: htmlText, idx: message.idx});
      })
      .catch(function(err) {  
          console.log('Failed to fetch page: ', err);  
    });
  });
}