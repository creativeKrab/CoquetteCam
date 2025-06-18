document.addEventListener("DOMContentLoaded", () => {
  let selectedFrameSrc = "";

  // GLOBAL: Make frame selectable
  window.selectFrame = function (src) {
    selectedFrameSrc = src;
    document.getElementById("frame-overlay").src = src;

    document.querySelectorAll(".frame-option").forEach(img => {
      img.classList.remove("selected");
      if (img.src === src) img.classList.add("selected");
    });
  };

  const video = document.getElementById("video");
  const captureBtn = document.getElementById("capture");

  if (video) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play(); // Ensures the webcam feed is fully ready
        };
      })
      .catch(err => {
        alert("Camera access denied: " + err.message);
      });
  }

  if (captureBtn) {
    captureBtn.addEventListener("click", () => {
      if (!selectedFrameSrc) {
        alert("Please select a frame first!");
        return;
      }

      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 300;
      canvas.height = 300;


      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, 300, 300);
      } else {
        alert("Camera is still loading, please wait a second and try again.");
        return;
      }

      const frame = new Image();
      frame.crossOrigin = "anonymous";
      frame.src = selectedFrameSrc;

      frame.onload = () => {
        ctx.drawImage(frame, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL("image/png");

        const formData = new FormData();
        formData.append("image", dataUrl);

        console.log("Sending image:", dataUrl.slice(0, 50));
        fetch("/result", {
          method: "POST",
          body: formData
        })
          .then(res => {
            if (res.redirected) {
              window.location.href = res.url;
            } else {
              alert("Something went wrong while saving your photo.");
            }
          })
          .catch(error => {
            alert("Error uploading image: " + error.message);
          });
      };

      // ❗ make sure the image is not cached or cross-origin blocked
      frame.onerror = () => {
        alert("Failed to load the selected frame.");
      };
    });
  }
});
