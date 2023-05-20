// Listen for keyboard shortcut event
document.addEventListener("keydown", function (event) {
  if (event.altKey && event.shiftKey && event.code === "KeyL") {
    const highlightedText = window.getSelection().toString();

    // Send message to background script with the highlighted text
    chrome.runtime.sendMessage({ command: "searchVideos", text: highlightedText }, function (response) {
      if (response && response.videos) {
        // Display the popup with the retrieved videos
        openPopup(response.videos);
      } else if (response && response.error) {
        console.error("Error retrieving videos:", response.error);
      } else {
        console.error("Unexpected response from background script:", response);
      }
    });
  }
});

// Open the popup modal with the retrieved videos
function openPopup(videos) {
  const modalContainer = document.createElement("div");
  modalContainer.className = "modal fade";
  modalContainer.tabIndex = -1;
  modalContainer.role = "dialog";
  modalContainer.id = "linkTubeModal";

  const modalDialog = document.createElement("div");
  modalDialog.className = "modal-dialog";
  modalDialog.role = "document";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "close";
  closeButton.setAttribute("data-dismiss", "modal");
  closeButton.innerHTML = `<span aria-hidden="true">&times;</span>`;

  modalHeader.appendChild(closeButton);

  const modalBody = document.createElement("div");
  modalBody.className = "modal-body";

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

    videoElement.addEventListener("click", function () {
      // Send message to background script with the selected video URL
      chrome.runtime.sendMessage({ command: "insertHyperlink", url: videoLink }, function (response) {
        if (response && response.success) {
          console.log("Hyperlink inserted successfully");
        } else {
          console.error("Failed to insert hyperlink");
        }
      });

      // Close the modal after the video is selected
      modalContainer.classList.remove("show");
    });

    modalBody.appendChild(videoElement);
  });

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalDialog.appendChild(modalContent);
  modalContainer.appendChild(modalDialog);

  document.body.appendChild(modalContainer);

  // Open the Bootstrap modal
  const linkTubeModal = new bootstrap.Modal(document.getElementById("linkTubeModal"));
  linkTubeModal.show();
}
