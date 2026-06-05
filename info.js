const infoImages = [
  "https://225-henry.github.io/picx-images-hosting/LIUPS_0004.9ddlwwhz7x.jpg",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_0003.8dxijpxiyf.jpg",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_0002.b9jsm6dn5.jpg",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_DSF0969.5tro71rp50.JPG",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_DSF7389.67y3zmqz6m.jpg",
  "https://225-henry.github.io/picx-images-hosting/LIUPS_R0006007.7w7gwtd6rx.jpg"
];

const infoImage = document.querySelector("[data-info-image]");

if (infoImage) {
  let currentIndex = Math.floor(Math.random() * infoImages.length);

  infoImage.decoding = "async";
  infoImage.loading = "eager";
  infoImage.fetchPriority = "high";
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
