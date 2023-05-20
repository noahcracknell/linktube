const apiKey = "AIzaSyARUNfahHptuChfSelKi_Kwu5MoN0egdJI"; // Replace with your actual API key

chrome.storage.sync.set({ apiKey: apiKey }, function() {
  console.log("API key is stored.");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === "requestVideos") {
    const tabId = sender.tab ? sender.tab.id : null;
    const highlightedText = getHighlightedText(tabId);
    if (highlightedText) {
      searchYouTubeVideos(highlightedText)
        .then((videos) => {
          sendResponse({ videos });
        })
        .catch((error) => {
          console.error("Error searching YouTube videos:", error);
          sendResponse({ error: "Failed to search YouTube videos" });
        });
      return true; // Indicates that sendResponse will be called asynchronously
    }
  } else if (request.command === "insertHyperlink") {
    const url = request.url;
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { command: "insertHyperlink", url }, function (response) {
        if (response && response.success) {
          sendResponse({ success: true });
        } else {
          sendResponse({ error: "Failed to insert hyperlink" });
        }
      });
    } else {
      sendResponse({ error: "Failed to insert hyperlink: Invalid tab" });
    }
    return true; // Indicates that sendResponse will be called asynchronously
  }  
});


function getHighlightedText(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { command: "getHighlightedText" }, function (response) {
      if (response && response.text) {
        resolve(response.text);
      } else {
        reject(new Error("Failed to get highlighted text"));
      }
    });
  });
}

function searchYouTubeVideos(text) {
  const maxResults = 3;

  const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&q=${encodeURIComponent(
    text
  )}&maxResults=${maxResults}`;

  console.log("API request URL:", url);

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to search YouTube videos. HTTP status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        throw new Error(`YouTube API error: ${data.error.message}`);
      }

      if (data.items && data.items.length > 0) {
        return data.items.map((item) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
        }));
      } else {
        throw new Error("No videos found.");
      }
    })
    .catch((error) => {
      console.error("Error searching YouTube videos:", error);
      throw error;
    });
}
