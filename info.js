const infoImages = [
  "https://225-henry.github.io/picx-images-hosting/LIUPS_0004.9ddlwwhz7x.jpg",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_0003.8dxijpxiyf.jpg",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_0002.5c1mihw6q3.jpg",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_DSF0969.5tro71rp50.JPG"
];

const infoImage = document.querySelector("[data-info-image]");

if (infoImage) {
  let currentIndex = Math.floor(Math.random() * infoImages.length);

  infoImage.decoding = "async";
  infoImage.src = infoImages[currentIndex];

  infoImage.addEventListener("click", () => {
    let nextIndex = Math.floor(Math.random() * infoImages.length);

    while (nextIndex === currentIndex && infoImages.length > 1) {
      nextIndex = Math.floor(Math.random() * infoImages.length);
    }

    currentIndex = nextIndex;
    infoImage.src = infoImages[currentIndex];
  });
}
