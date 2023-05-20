// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the videos container element
  const videosContainer = document.getElementById("videos-container");

  // Check if the videos container element exists
  if (!videosContainer) {
    console.error("Videos container element not found");
    return;
  }

  // Send message to the background script to request videos
  chrome.runtime.sendMessage({ command: "requestVideos" }, function (response) {
    if (chrome.runtime.lastError) {
      const errorMessage = chrome.runtime.lastError.message;
      console.error("Error sending message to background script:", errorMessage);
      displayErrorMessage("Failed to retrieve videos");
    } else if (response && response.videos) {
      displayVideos(response.videos);
    } else if (response && response.error) {
      console.error("Error retrieving videos:", response.error);
      displayErrorMessage("Failed to retrieve videos");
    } else {
      console.error("Unexpected response from background script:", response);
      displayErrorMessage("Failed to retrieve videos");
    }
  });

  // Display the YouTube videos in the popup
  function displayVideos(videos) {
    videosContainer.innerHTML = ""; // Clear previous content

    videos.forEach((video) => {
      const videoLink = `https://www.youtube.com/watch?v=${video.videoId}`;

      const videoElement = document.createElement("div");
      videoElement.className = "video";

      const thumbnailElement = document.createElement("img");
      thumbnailElement.src = video.thumbnail;
      thumbnailElement.alt = video.title;
      thumbnailElement.className = "video-thumbnail";

      const titleElement = document.createElement("p");
      titleElement.textContent = video.title;
      titleElement.className = "video-title";

      videoElement.appendChild(thumbnailElement);
      videoElement.appendChild(titleElement);

      // Handle click event to insert hyperlink into the highlighted text
      videoElement.addEventListener("click", function () {
        // Send message to background script with the selected video URL
        chrome.runtime.sendMessage({ command: "insertHyperlink", url: videoLink }, function (response) {
          if (response && response.success) {
            console.log("Hyperlink inserted successfully");
          } else {
            console.error("Failed to insert hyperlink");
          }
        });
      });

      videosContainer.appendChild(videoElement);
    });
  }

  // Display an error message in the popup
  function displayErrorMessage(message) {
    const errorMessageElement = document.createElement("p");
    errorMessageElement.textContent = message;
    errorMessageElement.className = "error-message";
    videosContainer.appendChild(errorMessageElement);
  }
});
